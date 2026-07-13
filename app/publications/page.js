import PublicationsPanel from "../../components/PublicationsPanel";
import { getPublications } from "../../lib/publications";

export const dynamic = "force-dynamic";

export default async function PublicationsPage() {
  const publications = await getPublications();

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

      <PublicationsPanel publications={publications} />
    </section>
  );
}
