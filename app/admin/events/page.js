import { EventForm } from "../../../components/AdminContentForms";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">Admin</p>
        <h2>Events</h2>
        <p>Create and update reading group meetings, seminars and internal events.</p>
      </div>

      <div className="admin-edit-grid">
        <EventForm />
        {events.map((event) => (
          <EventForm event={event} key={event.id} />
        ))}
      </div>
    </section>
  );
}
