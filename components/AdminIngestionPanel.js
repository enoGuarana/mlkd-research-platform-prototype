"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MAX_IDENTIFIER_BATCH } from "../lib/validation/publication-identifier";

const importMethods = {
  doi: {
    label: "DOI",
    fieldLabel: "DOIs",
    example: "10.48550/arXiv.2205.01833",
    placeholder: "10.48550/arXiv.2205.01833\n10.1145/example",
    help: `Paste up to ${MAX_IDENTIFIER_BATCH} DOI values, one per line.`,
  },
  title: {
    label: "Title",
    fieldLabel: "Publication title",
    example: "OpenAlex: A fully-open index of scholarly works, authors, venues, institutions, and concepts",
    placeholder: "Enter the complete publication title",
    help: "Search OpenAlex and choose the correct publication before importing.",
  },
  openalex: {
    label: "OpenAlex ID",
    fieldLabel: "OpenAlex IDs",
    example: "W2741809807",
    placeholder: "W2741809807",
    help: `Paste up to ${MAX_IDENTIFIER_BATCH} OpenAlex Work IDs, one per line.`,
  },
  url: {
    label: "URL",
    fieldLabel: "Publication URL",
    example: "https://openalex.org/W2741809807",
    placeholder: "https://publisher.example/article",
    help: "DOI and OpenAlex URLs import directly; other URLs show matching OpenAlex records.",
  },
};

function countIdentifiers(value) {
  return String(value ?? "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean).length;
}

export default function AdminIngestionPanel({ recentRuns, publicationCount }) {
  const router = useRouter();
  const [identifierType, setIdentifierType] = useState("doi");
  const [identifiers, setIdentifiers] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState("");
  const method = importMethods[identifierType];
  const supportsBatch = identifierType === "doi" || identifierType === "openalex";
  const identifierCount = useMemo(
    () => (supportsBatch ? countIdentifiers(identifiers) : identifiers.trim() ? 1 : 0),
    [identifiers, supportsBatch]
  );
  const exceedsBatchLimit = identifierCount > MAX_IDENTIFIER_BATCH;

  async function sendRequest(payload) {
    const response = await fetch("/api/publications/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const responsePayload = await response.json();

    if (!response.ok && response.status !== 207) {
      throw new Error(responsePayload.message ?? "Unable to import publications.");
    }

    return responsePayload;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setResult(null);
    setCandidates([]);

    try {
      const payload = await sendRequest({
        identifierType,
        identifiers,
      });

      if (payload.requiresSelection) {
        setCandidates(payload.candidates);
        return;
      }

      setResult(payload);
      if (payload.succeeded > 0) {
        setIdentifiers("");
      }
      router.refresh();
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function importCandidate(openalexId) {
    setIsSubmitting(true);
    setError("");
    setResult(null);

    try {
      const payload = await sendRequest({
        identifierType: "openalex",
        identifiers: openalexId,
        sourceIdentifierType: identifierType,
      });
      setResult(payload);
      setCandidates([]);
      setIdentifiers("");
      router.refresh();
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMethod(nextType) {
    setIdentifierType(nextType);
    setIdentifiers("");
    setResult(null);
    setCandidates([]);
    setError("");
  }

  return (
    <div className="admin-layout">
      <section className="admin-panel" aria-labelledby="publication-ingestion-title">
        <div className="panel-heading">
          <p className="eyebrow">Publication ingestion</p>
          <h3 id="publication-ingestion-title">Import publication</h3>
          <p>Choose how the publication should be found in OpenAlex.</p>
        </div>

        <form onSubmit={handleSubmit} className="ingestion-form">
          <fieldset className="ingestion-methods">
            <legend>Find publication by</legend>
            <div className="ingestion-method-options">
              {Object.entries(importMethods).map(([value, option]) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="identifierType"
                    value={value}
                    checked={identifierType === value}
                    onChange={() => changeMethod(value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            <span>{method.fieldLabel}</span>
            <textarea
              value={identifiers}
              onChange={(event) => setIdentifiers(event.target.value)}
              placeholder={method.placeholder}
              rows={supportsBatch ? 7 : 4}
            />
            <small>{method.help}</small>
          </label>

          <div className="admin-actions">
            <button
              className="button primary"
              type="submit"
              disabled={isSubmitting || identifierCount === 0 || exceedsBatchLimit}
            >
              {isSubmitting ? "Working..." : identifierType === "title" || identifierType === "url" ? "Find publication" : "Import"}
            </button>
            <button className="button secondary" type="button" onClick={() => setIdentifiers(method.example)}>
              Use example
            </button>
            {supportsBatch ? (
              <span className="input-count">
                {identifierCount}/{MAX_IDENTIFIER_BATCH} queued
              </span>
            ) : null}
          </div>
        </form>

        {exceedsBatchLimit ? (
          <p className="status-message error">
            Reduce this batch to {MAX_IDENTIFIER_BATCH} identifiers before importing.
          </p>
        ) : null}

        {error ? <p className="status-message error">{error}</p> : null}

        {candidates.length ? (
          <div className="result-panel" aria-live="polite">
            <h4>Choose the correct publication</h4>
            <div className="result-list">
              {candidates.map((candidate) => (
                <article className="result-item" key={candidate.openalexId}>
                  <span className="status-pill success">match</span>
                  <div>
                    <strong>{candidate.title}</strong>
                    <p>
                      {[candidate.authors.join(", "), candidate.publicationYear, candidate.venue]
                        .filter(Boolean)
                        .join(" / ")}
                    </p>
                    <button
                      className="button secondary"
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => importCandidate(candidate.openalexId)}
                    >
                      Import this publication
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {result ? (
          <div className={`result-panel${result.failed > 0 ? " partial" : ""}`} aria-live="polite">
            <h4>
              {result.succeeded} imported, {result.failed} failed
            </h4>
            <div className="result-list">
              {result.results.map((item) => (
                <article className="result-item" key={item.identifier}>
                  <span className={`status-pill ${item.status}`}>{item.status}</span>
                  <div>
                    <strong>{item.publication?.title ?? item.identifier}</strong>
                    <p>{item.message ?? [item.publication?.publicationYear, item.publication?.venue].filter(Boolean).join(" / ")}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <aside className="admin-panel" aria-labelledby="ingestion-status-title">
        <div className="panel-heading">
          <p className="eyebrow">Operational status</p>
          <h3 id="ingestion-status-title">Database overview</h3>
          <p>{publicationCount} publication records are currently available to the public site.</p>
        </div>

        <div className="admin-actions compact">
          <Link className="button secondary" href="/publications">
            View publications
          </Link>
        </div>

        <div className="run-list">
          <h4>Recent ingestion runs</h4>
          {recentRuns.length ? (
            recentRuns.map((run) => (
              <article className="run-item" key={run.id}>
                <div>
                  <strong>{new Date(run.createdAt).toLocaleString()}</strong>
                  <p>
                    {run.succeeded}/{run.total} imported by {importMethods[run.inputType]?.label ?? run.inputType}
                    {run.failed ? ` / ${run.failed} failed` : ""}
                  </p>
                </div>
                {run.errors.length ? (
                  <details>
                    <summary>Error details</summary>
                    {run.errors.map((runError) => (
                      <p key={runError.id}>
                        <strong>{runError.identifier}</strong>
                        {runError.code ? ` [${runError.code}]` : ""}: {runError.message}
                      </p>
                    ))}
                  </details>
                ) : null}
              </article>
            ))
          ) : (
            <p>No ingestion runs yet.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
