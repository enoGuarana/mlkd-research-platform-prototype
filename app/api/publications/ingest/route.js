import { revalidatePath } from "next/cache";
import { prisma } from "../../../../lib/prisma";
import { buildPublicationUpsertData } from "../../../../lib/publication-ingestion";
import {
  fetchOpenAlexWorkByDoi,
  fetchOpenAlexWorkById,
  normalizeOpenAlexWork,
  searchOpenAlexWorksByTitle,
  searchOpenAlexWorksByUrl,
} from "../../../../lib/services/bibliographic/openalex";
import {
  IDENTIFIER_TYPES,
  PublicationIdentifierError,
  identifierFromUrl,
  parsePublicationIdentifiers,
} from "../../../../lib/validation/publication-identifier";

export const runtime = "nodejs";

function candidateFromWork(work) {
  return {
    openalexId: work.id,
    doi: work.doi,
    title: work.title ?? work.display_name ?? "Untitled publication",
    publicationYear: work.publication_year ?? null,
    venue: work.primary_location?.source?.display_name ?? null,
    authors: (work.authorships ?? [])
      .map((authorship) => authorship.author?.display_name)
      .filter(Boolean)
      .slice(0, 4),
  };
}

async function searchCandidates(type, identifier) {
  const works =
    type === "title"
      ? await searchOpenAlexWorksByTitle(identifier)
      : await searchOpenAlexWorksByUrl(identifier);

  return works.map(candidateFromWork).filter((candidate) => candidate.openalexId);
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const identifierType = body.identifierType ?? (body.dois !== undefined ? "doi" : null);
  const input = body.identifiers ?? body.value ?? body.dois;
  let identifiers;

  try {
    identifiers = parsePublicationIdentifiers(identifierType, input);
  } catch (error) {
    if (!(error instanceof PublicationIdentifierError)) {
      throw error;
    }

    return Response.json(
      {
        code: error.code,
        message: error.message,
        invalidIdentifiers: error.details.invalidIdentifiers,
        maxBatchSize: error.details.maxBatchSize,
        results: [],
      },
      { status: 400 }
    );
  }

  if (identifierType === "title" || identifierType === "url") {
    const directIdentifier =
      identifierType === "url" ? identifierFromUrl(identifiers[0]) : null;

    if (!directIdentifier) {
      try {
        const candidates = await searchCandidates(identifierType, identifiers[0]);
        if (!candidates.length) {
          return Response.json(
            {
              code: "OPENALEX_NOT_FOUND",
              message: "No matching publication was found in OpenAlex.",
              candidates: [],
              results: [],
            },
            { status: 404 }
          );
        }

        return Response.json({
          requiresSelection: true,
          query: identifiers[0],
          candidates,
          results: [],
        });
      } catch (error) {
        return Response.json(
          {
            code: error.code ?? "INGESTION_ERROR",
            message: error.message ?? "Unable to search OpenAlex.",
            retryable: Boolean(error.retryable),
            candidates: [],
            results: [],
          },
          { status: error.code === "OPENALEX_NOT_FOUND" ? 404 : 502 }
        );
      }
    }

    identifiers = [directIdentifier.value];
    body.resolvedIdentifierType = directIdentifier.type;
  }

  const resolvedIdentifierType = body.resolvedIdentifierType ?? identifierType;
  const runInputType = IDENTIFIER_TYPES.includes(body.sourceIdentifierType)
    ? body.sourceIdentifierType
    : identifierType;

  const run = await prisma.ingestionRun.create({
    data: {
      inputType: runInputType,
      total: identifiers.length,
    },
  });

  const results = [];
  let succeeded = 0;
  let failed = 0;

  for (const identifier of identifiers) {
    try {
      const work =
        resolvedIdentifierType === "doi"
          ? await fetchOpenAlexWorkByDoi(identifier)
          : await fetchOpenAlexWorkById(identifier);
      const normalized = normalizeOpenAlexWork(
        work,
        resolvedIdentifierType === "doi" ? identifier : undefined
      );

      const publication = await prisma.publication.upsert({
        ...buildPublicationUpsertData(normalized),
        select: {
          doi: true,
          title: true,
          publicationYear: true,
          venue: true,
        },
      });

      succeeded += 1;
      results.push({
        identifier,
        doi: publication.doi,
        status: "success",
        publication,
      });
    } catch (error) {
      const code = error.code ?? "INGESTION_ERROR";
      const message = error.message ?? "Unable to ingest publication.";
      const retryable = Boolean(error.retryable);

      failed += 1;
      await prisma.ingestionError.create({
        data: {
          runId: run.id,
          identifier,
          identifierType: resolvedIdentifierType,
          code,
          message,
          retryable,
        },
      });
      results.push({
        identifier,
        doi: resolvedIdentifierType === "doi" ? identifier : null,
        status: "error",
        code,
        message,
        retryable,
      });
    }
  }

  await prisma.ingestionRun.update({
    where: { id: run.id },
    data: {
      succeeded,
      failed,
      completedAt: new Date(),
    },
  });

  revalidatePath("/publications");
  revalidatePath("/admin");

  return Response.json(
    {
      runId: run.id,
      identifierType: runInputType,
      total: identifiers.length,
      succeeded,
      failed,
      results,
    },
    { status: failed > 0 ? 207 : 200 }
  );
}
