import { getDissertations } from "../../lib/content";

export const dynamic = "force-dynamic";

export default async function DissertationsPage() {
  const dissertationGroups = await getDissertations();

  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">MSc Dissertations</p>
        <h2>Dissertation opportunities and records</h2>
        <p>
          This section mirrors the original dissertation entry points: new, ongoing and finished
          dissertations.
        </p>
      </div>

      <div className="topic-grid">
        {dissertationGroups.map((item) => (
          <article className="topic-card active" key={item.label ?? item.title}>
            <span>MSc</span>
            <h3>{item.label ?? item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
