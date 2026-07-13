import { getProjects } from "../../lib/content";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();
  const activeProjects = projects.filter((project) => project.status === "Active project");
  const pastProjects = projects.filter((project) => project.status === "Past project");
  const normalizedActiveProjects = projects.filter((project) => project.status === "active");
  const normalizedPastProjects = projects.filter((project) => project.status === "past");

  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">Projects</p>
        <h2>Active and past projects</h2>
        <p>
          Funded research work is grouped by project status, matching the original MLKD site
          while keeping the content easy to move into the database later.
        </p>
      </div>

      <ProjectGroup title="Active Projects" projects={normalizedActiveProjects.length ? normalizedActiveProjects : activeProjects} />
      <ProjectGroup title="Past Projects" projects={normalizedPastProjects.length ? normalizedPastProjects : pastProjects} />
    </section>
  );
}

function ProjectGroup({ title, projects }) {
  return (
    <section className="content-group" aria-labelledby={`${title.replaceAll(" ", "-")}-title`}>
      <h3 id={`${title.replaceAll(" ", "-")}-title`}>{title}</h3>
      <div className="topic-grid">
        {projects.map((project) => (
          <article className="topic-card" key={project.title}>
            <span>{project.funder}</span>
            <h3>{project.title}</h3>
            <p>{project.lead}</p>
            <p>{project.period}{project.funder ? `, financed by ${project.funder}` : ""}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
