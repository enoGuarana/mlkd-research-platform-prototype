const test = require("node:test");
const assert = require("node:assert/strict");

const { buildPublicationUpsertData } = require("../lib/publication-ingestion");

test("hides a newly imported publication until editorial review", () => {
  const normalized = { doi: "10.1000/example", title: "Example" };
  const data = buildPublicationUpsertData(normalized);

  assert.equal(data.create.reviewStatus, "imported");
  assert.equal(data.create.isVisible, false);
});

test("does not overwrite editorial fields during reingestion", () => {
  const normalized = { doi: "10.1000/example", title: "Updated title" };
  const data = buildPublicationUpsertData(normalized);

  assert.deepEqual(data.update, normalized);
  assert.equal(Object.hasOwn(data.update, "isVisible"), false);
  assert.equal(Object.hasOwn(data.update, "reviewStatus"), false);
  assert.equal(Object.hasOwn(data.update, "publicSummary"), false);
});

test("uses OpenAlex ID when an imported publication has no DOI", () => {
  const data = buildPublicationUpsertData({
    doi: "",
    openalexId: "https://openalex.org/W123",
    title: "Publication without DOI",
  });

  assert.deepEqual(data.where, { openalexId: "https://openalex.org/W123" });
});
