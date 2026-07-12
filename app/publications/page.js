import PublicationsPanel from "../../components/PublicationsPanel";

export default function PublicationsPage() {
  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">Publication portal</p>
        <h2>Searchable publications with AI-readable summaries</h2>
        <p>
          This module keeps the publication discovery flow separated from the rest of the site,
          making it easier to evolve into a real content service later.
        </p>
      </div>

      <PublicationsPanel />
    </section>
  );
}
