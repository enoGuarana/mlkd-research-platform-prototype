const OPENALEX_BASE_URL = "https://api.openalex.org";
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_ATTEMPTS = 3;

const { isValidDoi, normalizeDoi } = require("../../validation/doi");
const {
  isValidOpenAlexId,
  normalizeOpenAlexId,
  normalizeUrl,
} = require("../../validation/publication-identifier");

const TOPIC_RULES = [
  {
    topic: "medical",
    topicLabel: "Medical AI",
    keywords: ["medicine", "medical", "clinical", "health", "pathology", "cardiology", "radiology"],
  },
  {
    topic: "nlp",
    topicLabel: "NLP and retrieval",
    keywords: ["language", "linguistics", "retrieval", "text", "semantic", "document", "information retrieval"],
  },
  {
    topic: "vision",
    topicLabel: "Vision and multimodal",
    keywords: ["computer vision", "image", "visual", "multimodal", "vision-language", "segmentation"],
  },
  {
    topic: "responsible",
    topicLabel: "Responsible AI",
    keywords: ["artificial intelligence", "ethics", "law", "governance", "copyright", "policy", "fairness"],
  },
];

class OpenAlexError extends Error {
  constructor(code, message, retryable = false, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = "OpenAlexError";
    this.code = code;
    this.retryable = retryable;
  }
}

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex || typeof invertedIndex !== "object") {
    return null;
  }

  const words = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    if (!Array.isArray(positions)) {
      continue;
    }

    for (const position of positions) {
      words[position] = word;
    }
  }

  const abstract = words.filter(Boolean).join(" ").trim();
  return abstract || null;
}

function mapTopic(topics = [], keywords = []) {
  const searchable = [...topics, ...keywords]
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      return [item.name, item.subfield, item.field, item.domain].filter(Boolean).join(" ");
    })
    .join(" ")
    .toLowerCase();

  const match = TOPIC_RULES.find((rule) => rule.keywords.some((keyword) => searchable.includes(keyword)));
  return match ?? { topic: "other", topicLabel: "Other" };
}

function normalizeOpenAlexWork(work, requestedDoi) {
  const authors = (work.authorships ?? []).map((authorship) => ({
    name: authorship.author?.display_name ?? "",
    openalexId: authorship.author?.id ?? null,
    orcid: authorship.author?.orcid ?? null,
    position: authorship.author_position ?? null,
    institutions: (authorship.institutions ?? []).map((institution) => ({
      name: institution.display_name,
      openalexId: institution.id,
      ror: institution.ror,
      countryCode: institution.country_code,
    })),
  }));

  const institutions = Array.from(
    new Map(
      authors
        .flatMap((author) => author.institutions)
        .filter((institution) => institution.openalexId)
        .map((institution) => [institution.openalexId, institution])
    ).values()
  );

  const topics = (work.topics ?? []).map((topic) => ({
    id: topic.id,
    name: topic.display_name,
    score: topic.score ?? null,
    subfield: topic.subfield?.display_name ?? null,
    field: topic.field?.display_name ?? null,
    domain: topic.domain?.display_name ?? null,
  }));

  const keywords = (work.keywords ?? []).map((keyword) => ({
    id: keyword.id,
    name: keyword.display_name,
    score: keyword.score ?? null,
  }));

  const mappedTopic = mapTopic(topics, keywords);
  const primaryLocation = work.primary_location ?? {};

  return {
    doi: normalizeDoi(work.doi || requestedDoi),
    openalexId: work.id,
    title: work.title ?? work.display_name ?? "Untitled publication",
    authorsJson: JSON.stringify(authors),
    topicsJson: JSON.stringify(topics),
    institutionsJson: JSON.stringify(institutions),
    keywordsJson: JSON.stringify(keywords),
    publicationYear: work.publication_year ?? null,
    publicationDate: work.publication_date ?? null,
    type: work.type ?? null,
    venue: primaryLocation.source?.display_name ?? null,
    abstract: reconstructAbstract(work.abstract_inverted_index),
    topic: mappedTopic.topic,
    topicLabel: mappedTopic.topicLabel,
    citedByCount: work.cited_by_count ?? 0,
    isOpenAccess: Boolean(work.open_access?.is_oa),
    landingPageUrl: primaryLocation.landing_page_url ?? work.open_access?.oa_url ?? null,
    pdfUrl: primaryLocation.pdf_url ?? work.open_access?.oa_url ?? null,
    rawOpenAlexJson: JSON.stringify(work),
    lastIngestedAt: new Date(),
  };
}

function retryDelay(response, attempt) {
  const retryAfter = response?.headers?.get?.("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    const dateDelay = Date.parse(retryAfter) - Date.now();
    const delay = Number.isFinite(seconds) ? seconds * 1_000 : dateDelay;

    if (Number.isFinite(delay) && delay > 0) {
      return Math.min(delay, 10_000);
    }
  }

  return 500 * 2 ** (attempt - 1);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function openAlexHttpError(response, identifier) {
  if (response.status === 404) {
    return new OpenAlexError(
      "OPENALEX_NOT_FOUND",
      `Publication not found in OpenAlex: ${identifier}`,
      false
    );
  }

  if (response.status === 429) {
    return new OpenAlexError(
      "OPENALEX_RATE_LIMITED",
      `OpenAlex rate limit reached for ${identifier}.`,
      true
    );
  }

  if (response.status >= 500) {
    return new OpenAlexError(
      "OPENALEX_UNAVAILABLE",
      `OpenAlex returned HTTP ${response.status} for ${identifier}.`,
      true
    );
  }

  return new OpenAlexError(
    "OPENALEX_HTTP_ERROR",
    `OpenAlex returned HTTP ${response.status} for ${identifier}.`,
    false
  );
}

function openAlexUrl(path, apiKey) {
  const url = new URL(path, OPENALEX_BASE_URL);
  if (apiKey) url.searchParams.set("api_key", apiKey);
  return url;
}

async function fetchOpenAlexJson(url, identifier, options = {}) {
  if (typeof options === "string") {
    options = { apiKey: options };
  }

  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const sleepImpl = options.sleepImpl ?? sleep;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxAttempts = Math.max(1, options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS);

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response;

    try {
      response = await fetchImpl(url, { signal: controller.signal });

      if (!response.ok) {
        throw openAlexHttpError(response, identifier);
      }

      try {
        return await response.json();
      } catch (error) {
        throw new OpenAlexError(
          "OPENALEX_INVALID_RESPONSE",
          `OpenAlex returned invalid JSON for ${identifier}.`,
          false,
          error
        );
      }
    } catch (error) {
      if (error instanceof OpenAlexError) {
        lastError = error;
      } else if (controller.signal.aborted || error?.name === "AbortError") {
        lastError = new OpenAlexError(
          "OPENALEX_TIMEOUT",
          `OpenAlex timed out for ${identifier}.`,
          true,
          error
        );
      } else {
        lastError = new OpenAlexError(
          "OPENALEX_NETWORK_ERROR",
          `Unable to reach OpenAlex for ${identifier}.`,
          true,
          error
        );
      }
    } finally {
      clearTimeout(timeout);
    }

    if (!lastError.retryable || attempt === maxAttempts) {
      throw lastError;
    }

    await sleepImpl(retryDelay(response, attempt));
  }

  throw lastError;
}

async function fetchOpenAlexWorkByDoi(doi, options = {}) {
  const normalizedDoi = normalizeDoi(doi);
  if (!isValidDoi(normalizedDoi)) {
    throw new OpenAlexError("INVALID_DOI", `Invalid DOI: ${normalizedDoi || "(empty)"}.`, false);
  }

  const apiKey = typeof options === "string" ? options : options.apiKey ?? process.env.OPENALEX_API_KEY;
  return fetchOpenAlexJson(
    openAlexUrl(`/works/doi:${normalizedDoi}`, apiKey),
    normalizedDoi,
    options
  );
}

async function fetchOpenAlexWorkById(openAlexId, options = {}) {
  const normalizedId = normalizeOpenAlexId(openAlexId);
  if (!isValidOpenAlexId(normalizedId)) {
    throw new OpenAlexError("INVALID_OPENALEX_ID", `Invalid OpenAlex ID: ${openAlexId}.`, false);
  }

  const apiKey = typeof options === "string" ? options : options.apiKey ?? process.env.OPENALEX_API_KEY;
  return fetchOpenAlexJson(openAlexUrl(`/works/${normalizedId}`, apiKey), normalizedId, options);
}

async function searchOpenAlexWorksByTitle(title, options = {}) {
  const query = String(title ?? "").trim();
  const apiKey = typeof options === "string" ? options : options.apiKey ?? process.env.OPENALEX_API_KEY;
  const url = openAlexUrl("/works", apiKey);
  url.searchParams.set("search.exact", query);
  url.searchParams.set("per_page", "5");
  const payload = await fetchOpenAlexJson(url, query, options);
  return Array.isArray(payload.results) ? payload.results : [];
}

async function searchOpenAlexWorksByUrl(value, options = {}) {
  const publicationUrl = normalizeUrl(value);
  if (!publicationUrl) {
    throw new OpenAlexError("INVALID_PUBLICATION_URL", "Invalid publication URL.", false);
  }

  const apiKey = typeof options === "string" ? options : options.apiKey ?? process.env.OPENALEX_API_KEY;
  const url = openAlexUrl("/works", apiKey);
  url.searchParams.set("filter", `locations.landing_page_url:${publicationUrl}`);
  url.searchParams.set("per_page", "5");
  const payload = await fetchOpenAlexJson(url, publicationUrl, options);
  return Array.isArray(payload.results) ? payload.results : [];
}

module.exports = {
  OpenAlexError,
  fetchOpenAlexWorkByDoi,
  fetchOpenAlexWorkById,
  mapTopic,
  normalizeDoi,
  normalizeOpenAlexWork,
  reconstructAbstract,
  searchOpenAlexWorksByTitle,
  searchOpenAlexWorksByUrl,
};
