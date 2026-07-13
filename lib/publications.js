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
    title: publication.title,
    authors: formatAuthors(publication.authorsJson),
    year: publication.publicationYear ? String(publication.publicationYear) : "Unknown",
    venue: publication.venue ?? "Unknown venue",
    topic: publication.topic ?? "responsible",
    topicLabel: publication.topicLabel ?? "Responsible AI",
    abstract: publication.abstract ?? "No abstract available from OpenAlex.",
    accessible: publication.abstract ?? "No public summary has been generated yet.",
    industry: "Imported from OpenAlex. Add a local communication summary in the next content workflow.",
    social: `${publication.title} (${publication.publicationYear ?? "unknown year"})`,
    doi: publication.doi,
    openalexId: publication.openalexId,
  };
}

export async function getPublications() {
  try {
    const records = await prisma.publication.findMany({
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
