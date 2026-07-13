import { getEvents } from "../../lib/content";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">Events</p>
        <h2>Seminars and reading group meetings</h2>
        <p>
          Recent events are presented as a chronological list. The data is static for now and
          can later be moved into the same admin workflow.
        </p>
      </div>

      <div className="event-list">
        {events.map((event) => (
          <article className="event-item" key={`${event.date}-${event.title}`}>
            <div>
              <span>{event.date}</span>
              <h3>{event.type}</h3>
            </div>
            <div>
              <h3>{event.paperTitle ?? event.title}</h3>
              <p>Presented by {event.presenter}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
