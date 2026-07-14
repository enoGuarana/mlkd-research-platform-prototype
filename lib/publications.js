import { prisma } from "./prisma";
import { publications as fallbackPublications } from "../components/site-data";

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function formatAuthors(authorsJson) {
  const authors = parseJson(authorsJson, []);

  if (!Array.isArray(authors)) {
    return "";
  }

  return authors.map((author) => author.name).filter(Boolean).join(", ");
}

function toPublicationCard(publication) {
  return {
    id: publication.id,
    title: publication.title,
    authors: formatAuthors(publication.authorsJson),
    year: publication.publicationYear ? String(publication.publicationYear) : "Unknown",
    venue: publication.venue ?? "Unknown venue",
    topic: publication.topic ?? "responsible",
    topicLabel: publication.topicLabel ?? "Responsible AI",
    abstract: publication.abstract ?? "No abstract available from OpenAlex.",
    accessible: publication.publicSummary ?? publication.abstract ?? "No public summary has been added yet.",
    industry: publication.industryAngle ?? "No industry angle has been added yet.",
    social: publication.socialSnippet ?? `${publication.title} (${publication.publicationYear ?? "unknown year"})`,
    doi: publication.doi,
    openalexId: publication.openalexId,
  };
}

export async function getPublications() {
  try {
    const records = await prisma.publication.findMany({
      where: { isVisible: true },
      orderBy: [{ publicationYear: "desc" }, { title: "asc" }],
    });

    if (!records.length) {
      return fallbackPublications;
    }

    return records.map(toPublicationCard);
  } catch (error) {
    console.warn("Falling back to static publications:", error.message);
    return fallbackPublications;
  }
}
