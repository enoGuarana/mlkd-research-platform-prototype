const DOI_PATTERN = /^10\.\d{4,9}\/[A-Z0-9._;()/:+-]+$/i;

const MAX_DOI_LENGTH = 255;
const MAX_DOIS_PER_BATCH = 10;

class DoiInputError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "DoiInputError";
    this.code = code;
    this.details = details;
  }
}

function normalizeDoi(value) {
  return String(value ?? "")
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:/i, "")
    .trim()
    .toLowerCase();
}

function isValidDoi(value) {
  const doi = normalizeDoi(value);
  return doi.length > 0 && doi.length <= MAX_DOI_LENGTH && DOI_PATTERN.test(doi);
}

function splitDoiInput(value) {
  const entries = Array.isArray(value) ? value : String(value ?? "").split(/[\n,;]+/);

  return entries.map((entry) => String(entry ?? "").trim()).filter(Boolean);
}

function parseDoiBatch(value, options = {}) {
  const maxBatchSize = options.maxBatchSize ?? MAX_DOIS_PER_BATCH;
  const entries = splitDoiInput(value);
  const normalized = entries.map(normalizeDoi);
  const dois = Array.from(new Set(normalized));
  const invalidDois = Array.from(
    new Set(entries.filter((entry, index) => !isValidDoi(normalized[index])))
  );

  if (!entries.length) {
    throw new DoiInputError("EMPTY_DOI_INPUT", "Add at least one DOI.", {
      invalidDois: [],
      maxBatchSize,
    });
  }

  if (invalidDois.length) {
    throw new DoiInputError("INVALID_DOI_INPUT", "One or more DOI values are invalid.", {
      invalidDois,
      maxBatchSize,
    });
  }

  if (dois.length > maxBatchSize) {
    throw new DoiInputError(
      "DOI_BATCH_TOO_LARGE",
      `A maximum of ${maxBatchSize} unique DOIs can be ingested at once.`,
      {
        invalidDois: [],
        maxBatchSize,
      }
    );
  }

  return dois;
}

module.exports = {
  DoiInputError,
  MAX_DOI_LENGTH,
  MAX_DOIS_PER_BATCH,
  isValidDoi,
  normalizeDoi,
  parseDoiBatch,
};
