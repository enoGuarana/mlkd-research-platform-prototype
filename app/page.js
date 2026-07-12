import Link from "next/link";

const missionHighlights = [
  {
    title: "Research areas",
    description: "Medical AI, NLP, vision, responsible AI and computational biology.",
  },
  {
    title: "Publication intelligence",
    description: "Searchable records with AI-readable summaries for public and partner audiences.",
  },
  {
    title: "Operational flow",
    description: "A shared content and admin layer for easier maintenance and publication updates.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Machine Learning and Knowledge Discovery</p>
          <h1>Find MLKD research, people, publications and opportunities faster.</h1>
          <p>
            A modular Next.js research platform prototype designed for searchable
            publications, AI-assisted summaries, dynamic profiles and maintenance-ready content.
          </p>

          <div className="hero-actions">
            <Link className="button primary" href="/publications">
              Explore publications
            </Link>
            <Link className="button secondary" href="/admin">
              See maintenance flow
            </Link>
          </div>
        </div>

        <div className="hero-media">
          <img src="/home2-500w.png" alt="MLKD visual combining a human profile and medical imaging scans" />
          <div className="metric-strip" aria-label="Prototype highlights">
            <div>
              <strong>360+</strong>
              <span>publication records</span>
            </div>
            <div>
              <strong>5</strong>
              <span>research areas</span>
            </div>
            <div>
              <strong>1</strong>
              <span>editable content hub</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section intro-band" aria-labelledby="mission-title">
        <div>
          <p className="eyebrow">Mission</p>
          <h2 id="mission-title">Advance machine learning and its applications.</h2>
        </div>
        <p>
          MLKD spans medical imaging, natural language processing, reinforcement learning,
          learning theory, computer vision and computational biology. This modular Next.js
          version turns those research lines into a clean, navigable experience for visitors,
          collaborators and maintainers.
        </p>
      </section>

      <section className="section" aria-labelledby="modules-title">
        <div className="section-heading">
          <p className="eyebrow">Modular architecture</p>
          <h2 id="modules-title">Organized in React pages and shared content blocks</h2>
        </div>

        <div className="topic-grid">
          {missionHighlights.map((item) => (
            <article className="topic-card active" key={item.title}>
              <span>0{missionHighlights.indexOf(item) + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
