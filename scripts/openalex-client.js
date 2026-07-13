const OPENALEX_BASE_URL = "https://api.openalex.org";

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

function normalizeDoi(value) {
  return String(value ?? "")
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:/i, "")
    .toLowerCase();
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
  return match ?? { topic: "responsible", topicLabel: "Responsible AI" };
}

function normalizeOpenAlexWork(work) {
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
    doi: normalizeDoi(work.doi),
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

async function fetchOpenAlexWorkByDoi(doi, apiKey = process.env.OPENALEX_API_KEY) {
  const normalizedDoi = normalizeDoi(doi);
  if (!normalizedDoi) {
    throw new Error("DOI vazio ou invalido.");
  }

  const url = new URL(`${OPENALEX_BASE_URL}/works/doi:${normalizedDoi}`);
  if (apiKey) {
    url.searchParams.set("api_key", apiKey);
  }

  const response = await fetch(url);
  if (response.status === 404) {
    throw new Error(`DOI nao encontrado no OpenAlex: ${normalizedDoi}`);
  }

  if (!response.ok) {
    throw new Error(`OpenAlex retornou HTTP ${response.status} para ${normalizedDoi}`);
  }

  return response.json();
}

module.exports = {
  fetchOpenAlexWorkByDoi,
  normalizeDoi,
  normalizeOpenAlexWork,
};
