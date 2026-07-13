import {
  currentMembers as fallbackCurrentMembers,
  dissertationGroups,
  events as fallbackEvents,
  openPositions as fallbackOpenPositions,
  pastMembers as fallbackPastMembers,
  projects as fallbackProjects,
} from "../components/site-data";
import { prisma } from "./prisma";

export async function getMembers() {
  try {
    const members = await prisma.member.findMany({
      where: { isVisible: true },
      orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    });

    if (!members.length) {
      return {
        currentMembers: fallbackCurrentMembers,
        pastMembers: fallbackPastMembers.map((name) => ({ name, role: "Alumni" })),
      };
    }

    return {
      currentMembers: members.filter((member) => member.status === "current"),
      pastMembers: members.filter((member) => member.status === "past"),
    };
  } catch {
    return {
      currentMembers: fallbackCurrentMembers,
      pastMembers: fallbackPastMembers.map((name) => ({ name, role: "Alumni" })),
    };
  }
}

export async function getProjects() {
  try {
    const records = await prisma.project.findMany({
      where: { isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });

    return records.length ? records : fallbackProjects;
  } catch {
    return fallbackProjects;
  }
}

export async function getEvents() {
  try {
    const records = await prisma.event.findMany({
      where: { isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return records.length ? records : fallbackEvents;
  } catch {
    return fallbackEvents;
  }
}

export async function getDissertations() {
  try {
    const records = await prisma.dissertation.findMany({
      where: { isVisible: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });

    return records.length ? records : dissertationGroups;
  } catch {
    return dissertationGroups;
  }
}

export async function getOpenPositions() {
  try {
    const records = await prisma.openPosition.findMany({
      where: { isVisible: true, status: "open" },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    });

    return records.length ? records : fallbackOpenPositions;
  } catch {
    return fallbackOpenPositions;
  }
}
