#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const {
  fetchOpenAlexWorkByDoi,
  normalizeOpenAlexWork,
} = require("../lib/services/bibliographic/openalex");
const { DoiInputError, parseDoiBatch } = require("../lib/validation/doi");
const { buildPublicationUpsertData } = require("../lib/publication-ingestion");

async function main() {
  const prisma = new PrismaClient();
  let uniqueDois;

  try {
    uniqueDois = parseDoiBatch(process.argv.slice(2));
  } catch (error) {
    if (!(error instanceof DoiInputError)) {
      throw error;
    }

    console.error(`${error.code}: ${error.message}`);
    if (error.details.invalidDois.length) {
      console.error(`Invalid values: ${error.details.invalidDois.join(", ")}`);
    }
    console.error("Usage: npm run ingest:publications -- 10.1000/example 10.2000/another");
    await prisma.$disconnect();
    process.exitCode = 1;
    return;
  }

  const run = await prisma.ingestionRun.create({
    data: {
      total: uniqueDois.length,
    },
  });

  let succeeded = 0;
  let failed = 0;

  for (const doi of uniqueDois) {
    try {
      const work = await fetchOpenAlexWorkByDoi(doi);
      const normalized = normalizeOpenAlexWork(work, doi);

      await prisma.publication.upsert({
        ...buildPublicationUpsertData(normalized),
      });

      succeeded += 1;
      console.log(`OK ${doi}`);
    } catch (error) {
      const code = error.code ?? "INGESTION_ERROR";
      const message = error.message ?? "Unable to ingest publication.";
      const retryable = Boolean(error.retryable);

      failed += 1;
      await prisma.ingestionError.create({
        data: {
          runId: run.id,
          identifier: doi,
          identifierType: "doi",
          code,
          message,
          retryable,
        },
      });
      console.error(`ERROR ${doi} [${code}]: ${message}`);
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

  await prisma.$disconnect();

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
