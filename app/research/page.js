import { researchAreas } from "../../components/site-data";

export default function ResearchPage() {
  return (
    <section className="section" aria-labelledby="research-title">
      <div className="section-heading">
        <p className="eyebrow">Research discovery</p>
        <h2 id="research-title">Research areas map</h2>
        <p>
          The research module acts as the thematic entry point for the platform and can evolve
          into a dynamic graph based on publication and member metadata.
        </p>
      </div>

      <div className="topic-grid">
        {researchAreas.map((area, index) => (
          <article className={`topic-card${index === 0 ? " active" : ""}`} key={area.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{area.title}</h3>
            <p>{area.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
