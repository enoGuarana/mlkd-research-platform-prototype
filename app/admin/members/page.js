import { MemberForm } from "../../../components/AdminContentForms";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const members = await prisma.member.findMany({
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">Admin</p>
        <h2>Team members</h2>
        <p>Edit current members and alumni shown on the public Team page.</p>
      </div>

      <div className="admin-edit-grid">
        <MemberForm />
        {members.map((member) => (
          <MemberForm member={member} key={member.id} />
        ))}
      </div>
    </section>
  );
}
