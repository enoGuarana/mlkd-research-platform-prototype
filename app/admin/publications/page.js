import { PublicationForm } from "../../../components/AdminContentForms";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPublicationsPage() {
  const publications = await prisma.publication.findMany({
    orderBy: [{ publicationYear: "desc" }, { title: "asc" }],
  });

  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">Admin</p>
        <h2>Publications</h2>
        <p>
          Create manual publication records or edit imported metadata, summaries, visibility and
          source links.
        </p>
      </div>

      <div className="admin-actions compact">
        <a className="button secondary" href="/admin">
          Back to admin
        </a>
        <a className="button secondary" href="/publications">
          View public page
        </a>
      </div>

      <div className="admin-edit-grid publication-admin-grid">
        <PublicationForm />
        {publications.map((publication) => (
          <PublicationForm publication={publication} key={publication.id} />
        ))}
      </div>
    </section>
  );
}
