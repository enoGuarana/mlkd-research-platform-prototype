import { opportunities } from "../../components/site-data";

export default function OpportunitiesPage() {
  return (
    <section className="section opportunity-band" aria-labelledby="opportunities-title">
      <div>
        <p className="eyebrow">MSc and PhD opportunities</p>
        <h2 id="opportunities-title">Clear entry points for students and collaborators.</h2>
        <p>
          Open topics, research challenges and collaboration briefings are exposed through a
          dedicated module so candidates and partner institutions can navigate them quickly.
        </p>
      </div>

      <div className="opportunity-list">
        {opportunities.map((item) => (
          <article key={item.title}>
            <span>{item.label}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
