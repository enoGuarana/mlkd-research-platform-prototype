"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const exampleDoi = "10.48550/arXiv.2205.01833";

function countDois(value) {
  return String(value ?? "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean).length;
}

export default function AdminIngestionPanel({ recentRuns, publicationCount }) {
  const router = useRouter();
  const [dois, setDois] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const doiCount = useMemo(() => countDois(dois), [dois]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/publications/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dois }),
      });

      const payload = await response.json();
      if (!response.ok && response.status !== 207) {
        throw new Error(payload.message ?? "Unable to ingest publications.");
      }

      setResult(payload);
      if (payload.succeeded > 0) {
        setDois("");
      }
      router.refresh();
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-layout">
      <section className="admin-panel" aria-labelledby="doi-ingestion-title">
        <div className="panel-heading">
          <p className="eyebrow">Publication ingestion</p>
          <h3 id="doi-ingestion-title">Import articles by DOI</h3>
          <p>
            Paste one DOI per line, or separate multiple DOIs with commas or semicolons.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="ingestion-form">
          <label>
            <span>DOIs</span>
            <textarea
              value={dois}
              onChange={(event) => setDois(event.target.value)}
              placeholder={`${exampleDoi}\n10.1145/example`}
              rows={7}
            />
          </label>

          <div className="admin-actions">
            <button className="button primary" type="submit" disabled={isSubmitting || doiCount === 0}>
              {isSubmitting ? "Importing..." : "Import DOIs"}
            </button>
            <button className="button secondary" type="button" onClick={() => setDois(exampleDoi)}>
              Use example
            </button>
            <span className="input-count">{doiCount} queued</span>
          </div>
        </form>

        {error ? <p className="status-message error">{error}</p> : null}

        {result ? (
          <div className={`result-panel${result.failed > 0 ? " partial" : ""}`} aria-live="polite">
            <h4>
              {result.succeeded} imported, {result.failed} failed
            </h4>
            <div className="result-list">
              {result.results.map((item) => (
                <article className="result-item" key={item.doi}>
                  <span className={`status-pill ${item.status}`}>{item.status}</span>
                  <div>
                    <strong>{item.publication?.title ?? item.doi}</strong>
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
                    {run.succeeded}/{run.total} imported
                    {run.failed ? ` / ${run.failed} failed` : ""}
                  </p>
                </div>
                {run.errors.length ? (
                  <details>
                    <summary>Error details</summary>
                    {run.errors.map((runError) => (
                      <p key={runError.id}>
                        <strong>{runError.doi}</strong>: {runError.message}
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
