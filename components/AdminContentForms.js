import {
  deleteDissertation,
  deleteEvent,
  deleteMember,
  deleteOpenPosition,
  deletePublication,
  deleteProject,
  saveDissertation,
  saveEvent,
  saveMember,
  saveOpenPosition,
  savePublication,
  saveProject,
} from "../lib/admin-content-actions";

function Field({ label, name, defaultValue, type = "text", required = false }) {
  return (
    <label>
      <span>{label}</span>
      <input name={name} defaultValue={defaultValue ?? ""} type={type} required={required} />
    </label>
  );
}

function FileField({ label, name, accept }) {
  return (
    <label>
      <span>{label}</span>
      <input name={name} type="file" accept={accept} />
    </label>
  );
}

function TextArea({ label, name, defaultValue }) {
  return (
    <label>
      <span>{label}</span>
      <textarea name={name} defaultValue={defaultValue ?? ""} rows={3} />
    </label>
  );
}

function Checkbox({ label, name, defaultChecked = false }) {
  return (
    <label className="checkbox-field">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} />
      <span>{label}</span>
    </label>
  );
}

function Select({ label, name, defaultValue, options }) {
  return (
    <label>
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue}>
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Visibility({ record }) {
  return <Checkbox label="Visible on public site" name="isVisible" defaultChecked={record?.isVisible ?? true} />;
}

function FormShell({ title, action, deleteAction, record, children }) {
  return (
    <article className="admin-edit-card">
      <form action={action} className="admin-edit-form">
        <input name="id" type="hidden" defaultValue={record?.id ?? ""} />
        <h3>{title}</h3>
        {children}
        <Visibility record={record} />
        <div className="admin-actions">
          <button className="button primary" type="submit">
            Save
          </button>
        </div>
      </form>
      {record?.id ? (
        <form action={deleteAction}>
          <input name="id" type="hidden" defaultValue={record.id} />
          <button className="button secondary danger" type="submit">
            Delete
          </button>
        </form>
      ) : null}
    </article>
  );
}

export function MemberForm({ member }) {
  return (
    <FormShell
      title={member ? member.name : "Add member"}
      action={saveMember}
      deleteAction={deleteMember}
      record={member}
    >
      <Field label="Name" name="name" defaultValue={member?.name} required />
      <Field label="Role" name="role" defaultValue={member?.role} required />
      <Select
        label="Status"
        name="status"
        defaultValue={member?.status ?? "current"}
        options={[
          { value: "current", label: "Current" },
          { value: "past", label: "Past" },
        ]}
      />
      <Field label="Category" name="category" defaultValue={member?.category} />
      <Field label="Initials" name="initials" defaultValue={member?.initials} />
      <Field label="Sort order" name="sortOrder" defaultValue={member?.sortOrder ?? 0} type="number" />
      <Field label="Profile URL" name="profileUrl" defaultValue={member?.profileUrl} />
      {member?.photoUrl ? (
        <div className="admin-photo-preview">
          <img src={member.photoUrl} alt="" />
          <span>Current photo</span>
        </div>
      ) : null}
      <FileField label="Upload photo" name="photoFile" accept="image/png,image/jpeg,image/webp,image/gif" />
      <Field label="Photo URL" name="photoUrl" defaultValue={member?.photoUrl} />
      <Field label="Email" name="email" defaultValue={member?.email} type="email" />
    </FormShell>
  );
}

export function ProjectForm({ project }) {
  return (
    <FormShell
      title={project ? project.title : "Add project"}
      action={saveProject}
      deleteAction={deleteProject}
      record={project}
    >
      <Field label="Title" name="title" defaultValue={project?.title} required />
      <Select
        label="Status"
        name="status"
        defaultValue={project?.status ?? "active"}
        options={[
          { value: "active", label: "Active" },
          { value: "past", label: "Past" },
        ]}
      />
      <Field label="Lead" name="lead" defaultValue={project?.lead} />
      <Field label="Period" name="period" defaultValue={project?.period} />
      <Field label="Funder" name="funder" defaultValue={project?.funder} />
      <Field label="External URL" name="externalUrl" defaultValue={project?.externalUrl} />
      <Field label="Sort order" name="sortOrder" defaultValue={project?.sortOrder ?? 0} type="number" />
      <TextArea label="Description" name="description" defaultValue={project?.description} />
    </FormShell>
  );
}

export function EventForm({ event }) {
  return (
    <FormShell title={event ? event.title : "Add event"} action={saveEvent} deleteAction={deleteEvent} record={event}>
      <Field label="Title" name="title" defaultValue={event?.title} required />
      <Field label="Type" name="type" defaultValue={event?.type ?? "Reading Group Meeting"} />
      <Field label="Date" name="date" defaultValue={event?.date} />
      <Field label="Presenter" name="presenter" defaultValue={event?.presenter} />
      <Field label="Paper title" name="paperTitle" defaultValue={event?.paperTitle} />
      <Field label="Paper URL" name="paperUrl" defaultValue={event?.paperUrl} />
      <Field label="Sort order" name="sortOrder" defaultValue={event?.sortOrder ?? 0} type="number" />
      <TextArea label="Description" name="description" defaultValue={event?.description} />
    </FormShell>
  );
}

export function DissertationForm({ dissertation }) {
  return (
    <FormShell
      title={dissertation ? dissertation.title : "Add dissertation"}
      action={saveDissertation}
      deleteAction={deleteDissertation}
      record={dissertation}
    >
      <Field label="Title" name="title" defaultValue={dissertation?.title} required />
      <Select
        label="Status"
        name="status"
        defaultValue={dissertation?.status ?? "new"}
        options={[
          { value: "new", label: "New" },
          { value: "ongoing", label: "Ongoing" },
          { value: "finished", label: "Finished" },
        ]}
      />
      <Field label="Student" name="student" defaultValue={dissertation?.student} />
      <Field label="Supervisor" name="supervisor" defaultValue={dissertation?.supervisor} />
      <Field label="Year" name="year" defaultValue={dissertation?.year} type="number" />
      <Field label="URL" name="url" defaultValue={dissertation?.url} />
      <Field label="Sort order" name="sortOrder" defaultValue={dissertation?.sortOrder ?? 0} type="number" />
      <TextArea label="Description" name="description" defaultValue={dissertation?.description} />
    </FormShell>
  );
}

export function OpenPositionForm({ position }) {
  return (
    <FormShell
      title={position ? position.title : "Add open position"}
      action={saveOpenPosition}
      deleteAction={deleteOpenPosition}
      record={position}
    >
      <Field label="Title" name="title" defaultValue={position?.title} required />
      <Field label="Type" name="type" defaultValue={position?.type ?? "research"} />
      <Select
        label="Status"
        name="status"
        defaultValue={position?.status ?? "open"}
        options={[
          { value: "open", label: "Open" },
          { value: "closed", label: "Closed" },
        ]}
      />
      <Field label="Contact email" name="contactEmail" defaultValue={position?.contactEmail} />
      <Field label="Deadline" name="deadline" defaultValue={position?.deadline} />
      <Field label="Sort order" name="sortOrder" defaultValue={position?.sortOrder ?? 0} type="number" />
      <TextArea label="Description" name="description" defaultValue={position?.description} />
    </FormShell>
  );
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function listNames(value) {
  const items = parseJson(value ?? "[]", []);
  if (!Array.isArray(items)) return "";
  return items.map((item) => (typeof item === "string" ? item : item.name)).filter(Boolean).join(", ");
}

export function PublicationForm({ publication }) {
  return (
    <FormShell
      title={publication ? publication.title : "Add publication"}
      action={savePublication}
      deleteAction={deletePublication}
      record={publication}
    >
      <Field label="Title" name="title" defaultValue={publication?.title} required />
      <TextArea label="Authors" name="authors" defaultValue={listNames(publication?.authorsJson)} />
      <Field label="Year" name="publicationYear" defaultValue={publication?.publicationYear} type="number" />
      <Field label="Publication date" name="publicationDate" defaultValue={publication?.publicationDate} />
      <Field label="Venue" name="venue" defaultValue={publication?.venue} />
      <Field label="Type" name="type" defaultValue={publication?.type} />
      <Field label="DOI" name="doi" defaultValue={publication?.doi} />
      <Field label="OpenAlex ID" name="openalexId" defaultValue={publication?.openalexId} />
      <Select
        label="Review status"
        name="reviewStatus"
        defaultValue={publication?.reviewStatus ?? "manual"}
        options={[
          { value: "manual", label: "Manual" },
          { value: "imported", label: "Imported" },
          { value: "draft", label: "Draft" },
          { value: "reviewed", label: "Reviewed" },
          { value: "published", label: "Published" },
        ]}
      />
      <Field label="Topic key" name="topic" defaultValue={publication?.topic ?? "responsible"} />
      <Field label="Topic label" name="topicLabel" defaultValue={publication?.topicLabel ?? "Responsible AI"} />
      <TextArea label="Keywords" name="keywords" defaultValue={listNames(publication?.keywordsJson)} />
      <TextArea label="Abstract" name="abstract" defaultValue={publication?.abstract} />
      <TextArea label="Public summary" name="publicSummary" defaultValue={publication?.publicSummary} />
      <TextArea label="Industry angle" name="industryAngle" defaultValue={publication?.industryAngle} />
      <TextArea label="Social snippet" name="socialSnippet" defaultValue={publication?.socialSnippet} />
      <Field label="Citations" name="citedByCount" defaultValue={publication?.citedByCount ?? 0} type="number" />
      <Field label="Landing page URL" name="landingPageUrl" defaultValue={publication?.landingPageUrl} />
      <Field label="PDF URL" name="pdfUrl" defaultValue={publication?.pdfUrl} />
      <Checkbox label="Open access" name="isOpenAccess" defaultChecked={publication?.isOpenAccess ?? false} />
      <TextArea label="Raw source JSON" name="rawOpenAlexJson" defaultValue={publication?.rawOpenAlexJson ?? "{}"} />
    </FormShell>
  );
}
