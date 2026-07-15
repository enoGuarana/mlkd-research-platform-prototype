const test = require("node:test");
const assert = require("node:assert/strict");

const {
  identifierFromUrl,
  normalizeOpenAlexId,
  parsePublicationIdentifiers,
} = require("../lib/validation/publication-identifier");

test("normalizes OpenAlex work IDs and URLs", () => {
  assert.equal(normalizeOpenAlexId("w2741809807"), "W2741809807");
  assert.equal(
    normalizeOpenAlexId("https://api.openalex.org/works/W2741809807"),
    "W2741809807"
  );
});

test("parses DOI and OpenAlex identifier batches", () => {
  assert.deepEqual(parsePublicationIdentifiers("doi", "doi:10.1000/ONE"), ["10.1000/one"]);
  assert.deepEqual(
    parsePublicationIdentifiers("openalex", "W1\nhttps://openalex.org/W2"),
    ["W1", "W2"]
  );
});

test("requires useful title and URL input", () => {
  assert.throws(
    () => parsePublicationIdentifiers("title", "ab"),
    (error) => error.code === "INVALID_TITLE"
  );
  assert.throws(
    () => parsePublicationIdentifiers("url", "not a url"),
    (error) => error.code === "INVALID_PUBLICATION_URL"
  );
});

test("extracts direct identifiers from DOI and OpenAlex URLs", () => {
  assert.deepEqual(identifierFromUrl("https://doi.org/10.1000/Example"), {
    type: "doi",
    value: "10.1000/example",
  });
  assert.deepEqual(identifierFromUrl("https://openalex.org/W2741809807"), {
    type: "openalex",
    value: "W2741809807",
  });
  assert.equal(identifierFromUrl("https://publisher.example/article"), null);
});
