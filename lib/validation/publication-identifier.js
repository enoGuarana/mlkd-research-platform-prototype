const { MAX_DOIS_PER_BATCH, isValidDoi, normalizeDoi } = require("./doi");

const IDENTIFIER_TYPES = ["doi", "title", "openalex", "url"];
const MAX_IDENTIFIER_BATCH = MAX_DOIS_PER_BATCH;
const OPENALEX_ID_PATTERN = /^W\d+$/i;

class PublicationIdentifierError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "PublicationIdentifierError";
    this.code = code;
    this.details = details;
  }
}

function normalizeOpenAlexId(value) {
  const input = String(value ?? "").trim();

  return input
    .replace(/^https?:\/\/openalex\.org\//i, "")
    .replace(/^https?:\/\/api\.openalex\.org\/works\//i, "")
    .toUpperCase();
}

function isValidOpenAlexId(value) {
  return OPENALEX_ID_PATTERN.test(normalizeOpenAlexId(value));
}

function normalizeUrl(value) {
  const input = String(value ?? "").trim();
  if (!input || input.length > 2_048) return "";

  try {
    const url = new URL(input);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function splitBatch(value) {
  return String(value ?? "")
    .split(/[\n,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function inputError(code, message, invalidIdentifiers = []) {
  return new PublicationIdentifierError(code, message, {
    invalidIdentifiers,
    maxBatchSize: MAX_IDENTIFIER_BATCH,
  });
}

function parsePublicationIdentifiers(type, value) {
  if (!IDENTIFIER_TYPES.includes(type)) {
    throw inputError("INVALID_IDENTIFIER_TYPE", "Choose a valid publication identifier type.");
  }

  if (type === "title") {
    const title = String(value ?? "").trim();
    if (title.length < 3 || title.length > 500) {
      throw inputError(
        "INVALID_TITLE",
        "Enter a publication title between 3 and 500 characters.",
        title ? [title] : []
      );
    }
    return [title];
  }

  if (type === "url") {
    const url = normalizeUrl(value);
    if (!url) {
      throw inputError("INVALID_PUBLICATION_URL", "Enter a valid HTTP or HTTPS publication URL.");
    }
    return [url];
  }

  const entries = splitBatch(value);
  if (!entries.length) {
    throw inputError("EMPTY_IDENTIFIER_INPUT", "Enter at least one publication identifier.");
  }

  const normalize = type === "doi" ? normalizeDoi : normalizeOpenAlexId;
  const validate = type === "doi" ? isValidDoi : isValidOpenAlexId;
  const normalized = entries.map(normalize);
  const invalidIdentifiers = entries.filter((entry, index) => !validate(normalized[index]));

  if (invalidIdentifiers.length) {
    throw inputError(
      type === "doi" ? "INVALID_DOI_INPUT" : "INVALID_OPENALEX_ID",
      `One or more ${type === "doi" ? "DOI" : "OpenAlex ID"} values are invalid.`,
      invalidIdentifiers
    );
  }

  const identifiers = Array.from(new Set(normalized));
  if (identifiers.length > MAX_IDENTIFIER_BATCH) {
    throw inputError(
      "IDENTIFIER_BATCH_TOO_LARGE",
      `A maximum of ${MAX_IDENTIFIER_BATCH} identifiers can be imported at once.`
    );
  }

  return identifiers;
}

function identifierFromUrl(value) {
  const url = normalizeUrl(value);
  if (!url) return null;

  if (/^(dx\.)?doi\.org$/i.test(new URL(url).hostname)) {
    const doi = normalizeDoi(url);
    return isValidDoi(doi) ? { type: "doi", value: doi } : null;
  }

  const openAlexId = normalizeOpenAlexId(url);
  if (isValidOpenAlexId(openAlexId)) {
    return { type: "openalex", value: openAlexId };
  }

  return null;
}

module.exports = {
  IDENTIFIER_TYPES,
  MAX_IDENTIFIER_BATCH,
  PublicationIdentifierError,
  identifierFromUrl,
  isValidOpenAlexId,
  normalizeOpenAlexId,
  normalizeUrl,
  parsePublicationIdentifiers,
};
