"use server";

import { mkdir, writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import path from "path";
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

function optionalUnique(value) {
  return value || null;
}

function parseList(value) {
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function authorsJson(value) {
  return JSON.stringify(parseList(value).map((name) => ({ name })));
}

function keywordsJson(value) {
  return JSON.stringify(parseList(value).map((name) => ({ name })));
}

function safeFilePart(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function saveUploadedMemberPhoto(formData, memberName) {
  const file = formData.get("photoFile");
  if (!file || typeof file === "string" || !file.size) {
    return null;
  }

  const allowedTypes = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
    ["image/gif", "gif"],
  ]);
  const extension = allowedTypes.get(file.type);
  if (!extension) {
    return null;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "members");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${safeFilePart(memberName) || "member"}-${Date.now()}.${extension}`;
  const destination = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(destination, buffer);

  return `/uploads/members/${filename}`;
}

function refresh(paths) {
  for (const path of paths) {
    revalidatePath(path);
  }
  revalidatePath("/admin");
}

export async function saveMember(formData) {
  const id = text(formData, "id");
  const name = text(formData, "name");
  const uploadedPhotoUrl = await saveUploadedMemberPhoto(formData, name);
  const data = {
    name,
    role: text(formData, "role"),
    status: text(formData, "status") || "current",
    category: nullable(text(formData, "category")),
    initials: nullable(text(formData, "initials")),
    photoUrl: uploadedPhotoUrl ?? nullable(text(formData, "photoUrl")),
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

export async function savePublication(formData) {
  const id = text(formData, "id");
  const year = text(formData, "publicationYear");
  const citedByCount = text(formData, "citedByCount");
  const title = text(formData, "title");

  if (!title) return;

  const data = {
    doi: optionalUnique(text(formData, "doi").toLowerCase()),
    openalexId: optionalUnique(text(formData, "openalexId")),
    title,
    authorsJson: authorsJson(text(formData, "authors")),
    keywordsJson: keywordsJson(text(formData, "keywords")),
    publicationYear: year ? Number.parseInt(year, 10) : null,
    publicationDate: nullable(text(formData, "publicationDate")),
    type: nullable(text(formData, "type")),
    venue: nullable(text(formData, "venue")),
    abstract: nullable(text(formData, "abstract")),
    topic: nullable(text(formData, "topic")),
    topicLabel: nullable(text(formData, "topicLabel")),
    publicSummary: nullable(text(formData, "publicSummary")),
    industryAngle: nullable(text(formData, "industryAngle")),
    socialSnippet: nullable(text(formData, "socialSnippet")),
    reviewStatus: text(formData, "reviewStatus") || "manual",
    isVisible: boolValue(formData, "isVisible"),
    citedByCount: citedByCount ? Number.parseInt(citedByCount, 10) : 0,
    isOpenAccess: boolValue(formData, "isOpenAccess"),
    landingPageUrl: nullable(text(formData, "landingPageUrl")),
    pdfUrl: nullable(text(formData, "pdfUrl")),
    rawOpenAlexJson: text(formData, "rawOpenAlexJson") || "{}",
  };

  if (id) {
    await prisma.publication.update({ where: { id }, data });
  } else {
    await prisma.publication.create({ data });
  }

  refresh(["/publications", "/admin/publications"]);
}

export async function deletePublication(formData) {
  const id = text(formData, "id");
  if (id) {
    await prisma.publication.delete({ where: { id } });
    refresh(["/publications", "/admin/publications"]);
  }
}
