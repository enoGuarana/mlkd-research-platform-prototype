"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";

function text(formData, key) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function intValue(formData, key) {
  const value = Number.parseInt(text(formData, key), 10);
  return Number.isFinite(value) ? value : 0;
}

function boolValue(formData, key) {
  return formData.get(key) === "on";
}

function nullable(value) {
  return value || null;
}

function refresh(paths) {
  for (const path of paths) {
    revalidatePath(path);
  }
  revalidatePath("/admin");
}

export async function saveMember(formData) {
  const id = text(formData, "id");
  const data = {
    name: text(formData, "name"),
    role: text(formData, "role"),
    status: text(formData, "status") || "current",
    category: nullable(text(formData, "category")),
    initials: nullable(text(formData, "initials")),
    photoUrl: nullable(text(formData, "photoUrl")),
    profileUrl: nullable(text(formData, "profileUrl")),
    email: nullable(text(formData, "email")),
    sortOrder: intValue(formData, "sortOrder"),
    isVisible: boolValue(formData, "isVisible"),
  };

  if (!data.name || !data.role) return;
  if (id) {
    await prisma.member.update({ where: { id }, data });
  } else {
    await prisma.member.create({ data });
  }
  refresh(["/team"]);
}

export async function deleteMember(formData) {
  const id = text(formData, "id");
  if (id) {
    await prisma.member.delete({ where: { id } });
    refresh(["/team"]);
  }
}

export async function saveProject(formData) {
  const id = text(formData, "id");
  const data = {
    title: text(formData, "title"),
    status: text(formData, "status") || "active",
    lead: nullable(text(formData, "lead")),
    period: nullable(text(formData, "period")),
    funder: nullable(text(formData, "funder")),
    externalUrl: nullable(text(formData, "externalUrl")),
    description: nullable(text(formData, "description")),
    sortOrder: intValue(formData, "sortOrder"),
    isVisible: boolValue(formData, "isVisible"),
  };

  if (!data.title) return;
  if (id) {
    await prisma.project.update({ where: { id }, data });
  } else {
    await prisma.project.create({ data });
  }
  refresh(["/projects"]);
}

export async function deleteProject(formData) {
  const id = text(formData, "id");
  if (id) {
    await prisma.project.delete({ where: { id } });
    refresh(["/projects"]);
  }
}

export async function saveEvent(formData) {
  const id = text(formData, "id");
  const data = {
    title: text(formData, "title"),
    type: text(formData, "type") || "Reading Group Meeting",
    date: nullable(text(formData, "date")),
    presenter: nullable(text(formData, "presenter")),
    paperTitle: nullable(text(formData, "paperTitle")),
    paperUrl: nullable(text(formData, "paperUrl")),
    description: nullable(text(formData, "description")),
    sortOrder: intValue(formData, "sortOrder"),
    isVisible: boolValue(formData, "isVisible"),
  };

  if (!data.title) return;
  if (id) {
    await prisma.event.update({ where: { id }, data });
  } else {
    await prisma.event.create({ data });
  }
  refresh(["/events"]);
}

export async function deleteEvent(formData) {
  const id = text(formData, "id");
  if (id) {
    await prisma.event.delete({ where: { id } });
    refresh(["/events"]);
  }
}

export async function saveDissertation(formData) {
  const id = text(formData, "id");
  const year = text(formData, "year");
  const data = {
    title: text(formData, "title"),
    status: text(formData, "status") || "new",
    student: nullable(text(formData, "student")),
    supervisor: nullable(text(formData, "supervisor")),
    year: year ? Number.parseInt(year, 10) : null,
    description: nullable(text(formData, "description")),
    url: nullable(text(formData, "url")),
    sortOrder: intValue(formData, "sortOrder"),
    isVisible: boolValue(formData, "isVisible"),
  };

  if (!data.title) return;
  if (id) {
    await prisma.dissertation.update({ where: { id }, data });
  } else {
    await prisma.dissertation.create({ data });
  }
  refresh(["/dissertations"]);
}

export async function deleteDissertation(formData) {
  const id = text(formData, "id");
  if (id) {
    await prisma.dissertation.delete({ where: { id } });
    refresh(["/dissertations"]);
  }
}

export async function saveOpenPosition(formData) {
  const id = text(formData, "id");
  const data = {
    title: text(formData, "title"),
    type: text(formData, "type") || "research",
    description: nullable(text(formData, "description")),
    contactEmail: nullable(text(formData, "contactEmail")),
    deadline: nullable(text(formData, "deadline")),
    status: text(formData, "status") || "open",
    sortOrder: intValue(formData, "sortOrder"),
    isVisible: boolValue(formData, "isVisible"),
  };

  if (!data.title) return;
  if (id) {
    await prisma.openPosition.update({ where: { id }, data });
  } else {
    await prisma.openPosition.create({ data });
  }
  refresh(["/open-positions"]);
}

export async function deleteOpenPosition(formData) {
  const id = text(formData, "id");
  if (id) {
    await prisma.openPosition.delete({ where: { id } });
    refresh(["/open-positions"]);
  }
}
