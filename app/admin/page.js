export default function AdminPage() {
  return (
    <section className="section" aria-labelledby="admin-title">
      <div className="section-heading">
        <p className="eyebrow">Admin console concept</p>
        <h2 id="admin-title">Maintenance flow for content updating</h2>
        <p>
          The admin module is isolated so publication, people and opportunities records can be
          edited through a clean maintenance surface without touching the public site sections.
        </p>
      </div>

      <div className="visibility-grid">
        <article>
          <h3>Content maintenance</h3>
          <p>Manage profiles, publication metadata and opportunity briefings from one workspace.</p>
        </article>
        <article>
          <h3>Publishing workflow</h3>
          <p>Review drafts, validate summarization outputs and push approved content live.</p>
        </article>
        <article>
          <h3>Analytics overview</h3>
          <p>Track visibility signals and spot which research topics gain most traction.</p>
        </article>
      </div>
    </section>
  );
}
