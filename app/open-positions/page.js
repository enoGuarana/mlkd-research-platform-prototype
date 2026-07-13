import { getOpenPositions } from "../../lib/content";

export const dynamic = "force-dynamic";

export default async function OpenPositionsPage() {
  const openPositions = await getOpenPositions();

  return (
    <section className="section opportunity-band" aria-labelledby="positions-title">
      <div>
        <p className="eyebrow">Open positions</p>
        <h2 id="positions-title">Entry points for students and collaborators.</h2>
        <p>
          The original site exposes open positions as a top-level section. This page keeps that
          structure and can later be connected to a managed opportunities database.
        </p>
      </div>

      <div className="opportunity-list">
        {openPositions.map((item) => (
          <article key={item.title}>
            <span>{item.label ?? item.type}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
