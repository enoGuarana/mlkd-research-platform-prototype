import { people } from "../../components/site-data";

export default function PeoplePage() {
  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">Members and alumni</p>
        <h2>Dynamic profile directory</h2>
        <p>
          People are encapsulated as a dedicated module so profile data and topic tags can be
          updated independently from publication and research content.
        </p>
      </div>

      <div className="people-grid">
        {people.map((person) => (
          <article className="person-card" key={person.name}>
            <div className="avatar">{person.initials}</div>
            <h3>{person.name}</h3>
            <p>{person.role}</p>
            <div className="chips">
              {person.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
