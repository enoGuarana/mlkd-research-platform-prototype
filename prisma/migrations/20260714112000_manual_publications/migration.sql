-- Redefine Publication so manually maintained records do not require DOI or OpenAlex IDs.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Publication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doi" TEXT,
    "openalexId" TEXT,
    "title" TEXT NOT NULL,
    "authorsJson" TEXT NOT NULL DEFAULT '[]',
    "topicsJson" TEXT NOT NULL DEFAULT '[]',
    "institutionsJson" TEXT NOT NULL DEFAULT '[]',
    "keywordsJson" TEXT NOT NULL DEFAULT '[]',
    "publicationYear" INTEGER,
    "publicationDate" TEXT,
    "type" TEXT,
    "venue" TEXT,
    "abstract" TEXT,
    "topic" TEXT,
    "topicLabel" TEXT,
    "publicSummary" TEXT,
    "industryAngle" TEXT,
    "socialSnippet" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'imported',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "citedByCount" INTEGER NOT NULL DEFAULT 0,
    "isOpenAccess" BOOLEAN NOT NULL DEFAULT false,
    "landingPageUrl" TEXT,
    "pdfUrl" TEXT,
    "rawOpenAlexJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastIngestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "new_Publication" (
    "id",
    "doi",
    "openalexId",
    "title",
    "authorsJson",
    "topicsJson",
    "institutionsJson",
    "keywordsJson",
    "publicationYear",
    "publicationDate",
    "type",
    "venue",
    "abstract",
    "topic",
    "topicLabel",
    "publicSummary",
    "industryAngle",
    "socialSnippet",
    "reviewStatus",
    "isVisible",
    "citedByCount",
    "isOpenAccess",
    "landingPageUrl",
    "pdfUrl",
    "rawOpenAlexJson",
    "createdAt",
    "updatedAt",
    "lastIngestedAt"
)
SELECT
    "id",
    "doi",
    "openalexId",
    "title",
    "authorsJson",
    "topicsJson",
    "institutionsJson",
    "keywordsJson",
    "publicationYear",
    "publicationDate",
    "type",
    "venue",
    "abstract",
    "topic",
    "topicLabel",
    "publicSummary",
    "industryAngle",
    "socialSnippet",
    "reviewStatus",
    "isVisible",
    "citedByCount",
    "isOpenAccess",
    "landingPageUrl",
    "pdfUrl",
    COALESCE("rawOpenAlexJson", '{}'),
    "createdAt",
    "updatedAt",
    "lastIngestedAt"
FROM "Publication";

DROP TABLE "Publication";
ALTER TABLE "new_Publication" RENAME TO "Publication";

CREATE UNIQUE INDEX "Publication_doi_key" ON "Publication"("doi");
CREATE UNIQUE INDEX "Publication_openalexId_key" ON "Publication"("openalexId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
