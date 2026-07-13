import { ProjectForm } from "../../../components/AdminContentForms";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">Admin</p>
        <h2>Projects</h2>
        <p>Create and update active or past projects.</p>
      </div>

      <div className="admin-edit-grid">
        <ProjectForm />
        {projects.map((project) => (
          <ProjectForm project={project} key={project.id} />
        ))}
      </div>
    </section>
  );
}
