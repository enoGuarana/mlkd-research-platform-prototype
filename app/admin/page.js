import AdminIngestionPanel from "../../components/AdminIngestionPanel";
import LogoutButton from "../../components/LogoutButton";
import { prisma } from "../../lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [publicationCount, recentRuns] = await prisma.$transaction([
    prisma.publication.count(),
    prisma.ingestionRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        errors: {
          orderBy: { createdAt: "asc" },
          take: 5,
        },
      },
    }),
  ]);
  const serializedRuns = recentRuns.map((run) => ({
    ...run,
    createdAt: run.createdAt.toISOString(),
    completedAt: run.completedAt?.toISOString() ?? null,
    errors: run.errors.map((error) => ({
      ...error,
      createdAt: error.createdAt.toISOString(),
    })),
  }));

  return (
    <section className="section" aria-labelledby="admin-title">
      <div className="section-heading">
        <p className="eyebrow">Admin console concept</p>
        <h2 id="admin-title">Maintenance flow for content updating</h2>
        <p>
          The admin module is isolated so publication, people and opportunities records can be
          edited through a clean maintenance surface without touching the public site sections.
        </p>
        <div className="admin-actions">
          <LogoutButton />
        </div>
      </div>

      <AdminIngestionPanel publicationCount={publicationCount} recentRuns={serializedRuns} />

      <div className="admin-shortcuts" aria-label="Admin content sections">
        <Link className="admin-shortcut" href="/admin/members">
          <span>Team</span>
          <strong>Edit members and alumni</strong>
        </Link>
        <Link className="admin-shortcut" href="/admin/projects">
          <span>Projects</span>
          <strong>Update active and past projects</strong>
        </Link>
        <Link className="admin-shortcut" href="/admin/events">
          <span>Events</span>
          <strong>Manage seminars and reading group entries</strong>
        </Link>
        <Link className="admin-shortcut" href="/admin/dissertations">
          <span>Dissertations</span>
          <strong>Maintain MSc dissertation entries</strong>
        </Link>
        <Link className="admin-shortcut" href="/admin/open-positions">
          <span>Open positions</span>
          <strong>Publish or close opportunities</strong>
        </Link>
      </div>

      <div className="visibility-grid admin-principles">
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
