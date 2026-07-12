"use client";

import { useState } from "react";
import { publications } from "./site-data";

export default function PublicationsPanel() {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const [year, setYear] = useState("all");
  const [selectedTitle, setSelectedTitle] = useState(publications[0].title);

  const filtered = publications.filter((publication) => {
    const query = search.trim().toLowerCase();
    const searchable = [
      publication.title,
      publication.authors,
      publication.venue,
      publication.topicLabel,
      publication.abstract,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!query || searchable.includes(query)) &&
      (topic === "all" || publication.topic === topic) &&
      (year === "all" || publication.year === year)
    );
  });

  const availableTitle = filtered.some((publication) => publication.title === selectedTitle)
    ? selectedTitle
    : filtered[0]?.title ?? "";

  const selectedPublication = filtered.find((publication) => publication.title === availableTitle) ?? filtered[0];

  const summary = selectedPublication
    ? [
        {
          heading: "Selected paper",
          body: selectedPublication.title,
        },
        {
          heading: "Accessible summary",
          body: selectedPublication.accessible,
        },
        {
          heading: "Industry angle",
          body: selectedPublication.industry,
        },
        {
          heading: "Social snippet",
          body: selectedPublication.social,
        },
      ]
    : [];

  return (
    <div>
      <div className="toolbar" aria-label="Publication filters">
        <label className="search-field">
          <span>Search</span>
          <input
            id="publication-search"
            type="search"
            placeholder="Try: medical, LLM, copyright..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label>
          <span>Topic</span>
          <select id="topic-filter" value={topic} onChange={(event) => setTopic(event.target.value)}>
            <option value="all">All topics</option>
            <option value="medical">Medical AI</option>
            <option value="nlp">NLP and retrieval</option>
            <option value="vision">Vision and multimodal</option>
            <option value="responsible">Responsible AI</option>
          </select>
        </label>

        <label>
          <span>Year</span>
          <select id="year-filter" value={year} onChange={(event) => setYear(event.target.value)}>
            <option value="all">All years</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </label>
      </div>

      <div className="publication-layout">
        <div id="publication-list" className="publication-list" aria-live="polite">
          {filtered.length === 0 ? (
            <article className="publication-card">
              <h3>No matching publications</h3>
              <p>Try a broader keyword, topic or year.</p>
            </article>
          ) : (
            filtered.map((publication) => (
              <button
                key={publication.title}
                type="button"
                className={`publication-card${publication.title === availableTitle ? " selected" : ""}`}
                onClick={() => {
                  setSelectedTitle(publication.title);
                }}
              >
                <div className="publication-meta">
                  <span>{publication.year}</span>
                  <span>{publication.venue}</span>
                  <span>{publication.topicLabel}</span>
                </div>
                <h3>{publication.title}</h3>
                <p>{publication.authors}</p>
                <p>{publication.abstract}</p>
              </button>
            ))
          )}
        </div>

        <aside className="summary-panel" aria-labelledby="summary-title">
          <p className="eyebrow">AI assistant preview</p>
          <h3 id="summary-title">Generated communication assets</h3>

          {summary.length ? (
            <div id="summary-content">
              {summary.map((item) => (
                <div className="summary-block" key={item.heading}>
                  <h4>{item.heading}</h4>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No paper selected.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
