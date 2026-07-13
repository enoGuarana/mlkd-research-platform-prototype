import { OpenPositionForm } from "../../../components/AdminContentForms";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOpenPositionsPage() {
  const positions = await prisma.openPosition.findMany({
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">Admin</p>
        <h2>Open positions</h2>
        <p>Create and update public opportunities for MSc, PhD, research and collaboration.</p>
      </div>

      <div className="admin-edit-grid">
        <OpenPositionForm />
        {positions.map((position) => (
          <OpenPositionForm position={position} key={position.id} />
        ))}
      </div>
    </section>
  );
}
