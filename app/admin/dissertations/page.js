import { DissertationForm } from "../../../components/AdminContentForms";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDissertationsPage() {
  const dissertations = await prisma.dissertation.findMany({
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">Admin</p>
        <h2>Dissertations</h2>
        <p>Create and update new, ongoing and finished MSc dissertation entries.</p>
      </div>

      <div className="admin-edit-grid">
        <DissertationForm />
        {dissertations.map((dissertation) => (
          <DissertationForm dissertation={dissertation} key={dissertation.id} />
        ))}
      </div>
    </section>
  );
}
