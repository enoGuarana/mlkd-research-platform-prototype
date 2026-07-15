const test = require("node:test");
const assert = require("node:assert/strict");

const {
  fetchOpenAlexWorkByDoi,
  fetchOpenAlexWorkById,
  normalizeOpenAlexWork,
  reconstructAbstract,
  searchOpenAlexWorksByTitle,
  searchOpenAlexWorksByUrl,
} = require("../lib/services/bibliographic/openalex");

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

test("reconstructs an abstract from an inverted index", () => {
  assert.equal(
    reconstructAbstract({ useful: [2], "DOI-driven": [0], ingestion: [1] }),
    "DOI-driven ingestion useful"
  );
});

test("normalizes OpenAlex metadata and uses the neutral topic fallback", () => {
  const normalized = normalizeOpenAlexWork({
    doi: "https://doi.org/10.1000/Example",
    id: "https://openalex.org/W1",
    title: "Example publication",
    authorships: [
      {
        author: { display_name: "Ada Example", id: "A1", orcid: null },
        institutions: [{ display_name: "Example Lab", id: "I1", ror: "R1" }],
      },
    ],
    topics: [{ id: "T1", display_name: "Agriculture", score: 0.9 }],
    keywords: [],
    abstract_inverted_index: { Example: [0], abstract: [1] },
    primary_location: {},
  });

  assert.equal(normalized.doi, "10.1000/example");
  assert.equal(normalized.topic, "other");
  assert.equal(normalized.topicLabel, "Other");
  assert.equal(normalized.abstract, "Example abstract");
  assert.equal(JSON.parse(normalized.authorsJson)[0].name, "Ada Example");
});

test("preserves the requested DOI when OpenAlex omits it from the payload", () => {
  const normalized = normalizeOpenAlexWork(
    { id: "https://openalex.org/W2", title: "DOI fallback", primary_location: {} },
    "10.1000/fallback"
  );

  assert.equal(normalized.doi, "10.1000/fallback");
});

test("does not retry a missing DOI", async () => {
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    return new Response(null, { status: 404 });
  };

  await assert.rejects(
    fetchOpenAlexWorkByDoi("10.1000/missing", { fetchImpl, sleepImpl: async () => {} }),
    (error) => error.code === "OPENALEX_NOT_FOUND" && error.retryable === false
  );
  assert.equal(calls, 1);
});

test("retries a rate limit response and then succeeds", async () => {
  let calls = 0;
  const delays = [];
  const fetchImpl = async () => {
    calls += 1;
    return calls === 1
      ? new Response(null, { status: 429, headers: { "retry-after": "1" } })
      : jsonResponse({ id: "W1" });
  };

  const work = await fetchOpenAlexWorkByDoi("10.1000/retry", {
    fetchImpl,
    sleepImpl: async (delay) => delays.push(delay),
  });

  assert.equal(work.id, "W1");
  assert.equal(calls, 2);
  assert.deepEqual(delays, [1_000]);
});

test("reports a retryable timeout after exhausting attempts", async () => {
  let calls = 0;
  const fetchImpl = (_url, { signal }) =>
    new Promise((_resolve, reject) => {
      calls += 1;
      signal.addEventListener("abort", () => {
        const error = new Error("aborted");
        error.name = "AbortError";
        reject(error);
      });
    });

  await assert.rejects(
    fetchOpenAlexWorkByDoi("10.1000/timeout", {
      fetchImpl,
      maxAttempts: 2,
      sleepImpl: async () => {},
      timeoutMs: 1,
    }),
    (error) => error.code === "OPENALEX_TIMEOUT" && error.retryable === true
  );
  assert.equal(calls, 2);
});

test("fetches a work by normalized OpenAlex ID", async () => {
  let requestedUrl;
  const work = await fetchOpenAlexWorkById("https://openalex.org/W123", {
    fetchImpl: async (url) => {
      requestedUrl = url.toString();
      return jsonResponse({ id: "https://openalex.org/W123" });
    },
  });

  assert.equal(work.id, "https://openalex.org/W123");
  assert.match(requestedUrl, /\/works\/W123/);
});

test("searches title and landing-page URL without importing a result", async () => {
  const requestedUrls = [];
  const fetchImpl = async (url) => {
    requestedUrls.push(url.toString());
    return jsonResponse({ results: [{ id: "W1" }] });
  };

  assert.equal((await searchOpenAlexWorksByTitle("Example title", { fetchImpl })).length, 1);
  assert.equal(
    (await searchOpenAlexWorksByUrl("https://publisher.example/article", { fetchImpl })).length,
    1
  );
  assert.match(requestedUrls[0], /search\.exact=Example\+title/);
  assert.match(requestedUrls[1], /locations\.landing_page_url/);
});
