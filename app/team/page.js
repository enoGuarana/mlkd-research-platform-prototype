import { getMembers } from "../../lib/content";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const { currentMembers, pastMembers } = await getMembers();

  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow">Team</p>
        <h2>Meet our team</h2>
        <p>
          Current members and alumni are separated so the public site can preserve the original
          MLKD information architecture while the data model evolves.
        </p>
      </div>

      <h3>Current members</h3>
      <div className="people-grid">
        {currentMembers.map((person) => (
          <article className="person-card" key={person.name}>
            {person.photoUrl ? (
              <img className="avatar member-photo" src={person.photoUrl} alt={person.name} />
            ) : (
              <div className="avatar">{person.initials}</div>
            )}
            <h3>{person.name}</h3>
            <p>{person.role}</p>
          </article>
        ))}
      </div>

      <div className="section-heading compact-heading">
        <h3>Past members</h3>
      </div>
      <div className="chips alumni-list">
        {pastMembers.map((person) => (
          <span key={person.name}>{person.name}</span>
        ))}
      </div>
    </section>
  );
}
