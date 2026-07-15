const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DoiInputError,
  MAX_DOIS_PER_BATCH,
  isValidDoi,
  normalizeDoi,
  parseDoiBatch,
} = require("../lib/validation/doi");

test("normalizes DOI URLs and prefixes", () => {
  assert.equal(normalizeDoi(" https://doi.org/10.1000/Example "), "10.1000/example");
  assert.equal(normalizeDoi("doi:10.12345/ABC-123"), "10.12345/abc-123");
});

test("validates DOI shape and length", () => {
  assert.equal(isValidDoi("10.1000/example"), true);
  assert.equal(isValidDoi("not-a-doi"), false);
  assert.equal(isValidDoi(`10.1000/${"a".repeat(300)}`), false);
});

test("parses, normalizes, and deduplicates a DOI batch", () => {
  assert.deepEqual(
    parseDoiBatch("10.1000/ONE, doi:10.1000/two\nhttps://doi.org/10.1000/one"),
    ["10.1000/one", "10.1000/two"]
  );
});

test("rejects invalid DOI values as a complete batch", () => {
  assert.throws(
    () => parseDoiBatch("10.1000/valid, invalid"),
    (error) => {
      assert.equal(error instanceof DoiInputError, true);
      assert.equal(error.code, "INVALID_DOI_INPUT");
      assert.deepEqual(error.details.invalidDois, ["invalid"]);
      return true;
    }
  );
});

test("rejects batches above the synchronous limit", () => {
  const input = Array.from(
    { length: MAX_DOIS_PER_BATCH + 1 },
    (_, index) => `10.1000/item-${index}`
  );

  assert.throws(
    () => parseDoiBatch(input),
    (error) => error.code === "DOI_BATCH_TOO_LARGE"
  );
});
