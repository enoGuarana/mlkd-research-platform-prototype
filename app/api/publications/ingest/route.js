import { revalidatePath } from "next/cache";
import { prisma } from "../../../../lib/prisma";
import {
  fetchOpenAlexWorkByDoi,
  normalizeDoi,
  normalizeOpenAlexWork,
} from "../../../../scripts/openalex-client";

export const runtime = "nodejs";

function parseDoiInput(value) {
  return Array.from(
    new Set(
      String(value ?? "")
        .split(/[\n,;]+/)
        .map(normalizeDoi)
        .filter(Boolean)
    )
  );
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const dois = parseDoiInput(body.dois);

  if (!dois.length) {
    return Response.json(
      {
        message: "Add at least one DOI.",
        results: [],
      },
      { status: 400 }
    );
  }

  const run = await prisma.ingestionRun.create({
    data: {
      total: dois.length,
    },
  });

  const results = [];
  let succeeded = 0;
  let failed = 0;

  for (const doi of dois) {
    try {
      const work = await fetchOpenAlexWorkByDoi(doi);
      const normalized = normalizeOpenAlexWork(work);

      const publication = await prisma.publication.upsert({
        where: { doi: normalized.doi },
        update: normalized,
        create: normalized,
        select: {
          doi: true,
          title: true,
          publicationYear: true,
          venue: true,
        },
      });

      succeeded += 1;
      results.push({
        doi,
        status: "success",
        publication,
      });
    } catch (error) {
      failed += 1;
      await prisma.ingestionError.create({
        data: {
          runId: run.id,
          doi,
          message: error.message,
        },
      });
      results.push({
        doi,
        status: "error",
        message: error.message,
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
      total: dois.length,
      succeeded,
      failed,
      results,
    },
    { status: failed > 0 ? 207 : 200 }
  );
}
