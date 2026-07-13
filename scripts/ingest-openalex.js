#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const { fetchOpenAlexWorkByDoi, normalizeDoi, normalizeOpenAlexWork } = require("./openalex-client");

async function main() {
  const prisma = new PrismaClient();
  const dois = process.argv.slice(2).map(normalizeDoi).filter(Boolean);

  if (!dois.length) {
    console.error("Uso: npm run ingest:publications -- 10.1000/exemplo 10.2000/outro");
    await prisma.$disconnect();
    process.exitCode = 1;
    return;
  }

  const uniqueDois = Array.from(new Set(dois));
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
      const normalized = normalizeOpenAlexWork(work);

      await prisma.publication.upsert({
        where: { doi: normalized.doi },
        update: normalized,
        create: normalized,
      });

      succeeded += 1;
      console.log(`OK ${doi}`);
    } catch (error) {
      failed += 1;
      await prisma.ingestionError.create({
        data: {
          runId: run.id,
          doi,
          message: error.message,
        },
      });
      console.error(`ERRO ${doi}: ${error.message}`);
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
