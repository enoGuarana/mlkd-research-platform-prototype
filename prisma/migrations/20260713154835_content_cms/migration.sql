-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'current',
    "category" TEXT,
    "initials" TEXT,
    "photoUrl" TEXT,
    "profileUrl" TEXT,
    "email" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lead" TEXT,
    "period" TEXT,
    "funder" TEXT,
    "externalUrl" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Dissertation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "student" TEXT,
    "supervisor" TEXT,
    "year" INTEGER,
    "description" TEXT,
    "url" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Reading Group Meeting',
    "date" TEXT,
    "presenter" TEXT,
    "paperTitle" TEXT,
    "paperUrl" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OpenPosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'research',
    "description" TEXT,
    "contactEmail" TEXT,
    "deadline" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Publication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doi" TEXT NOT NULL,
    "openalexId" TEXT NOT NULL,
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
    "rawOpenAlexJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastIngestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Publication" ("abstract", "authorsJson", "citedByCount", "createdAt", "doi", "id", "institutionsJson", "isOpenAccess", "keywordsJson", "landingPageUrl", "lastIngestedAt", "openalexId", "pdfUrl", "publicationDate", "publicationYear", "rawOpenAlexJson", "title", "topic", "topicLabel", "topicsJson", "type", "updatedAt", "venue") SELECT "abstract", "authorsJson", "citedByCount", "createdAt", "doi", "id", "institutionsJson", "isOpenAccess", "keywordsJson", "landingPageUrl", "lastIngestedAt", "openalexId", "pdfUrl", "publicationDate", "publicationYear", "rawOpenAlexJson", "title", "topic", "topicLabel", "topicsJson", "type", "updatedAt", "venue" FROM "Publication";
DROP TABLE "Publication";
ALTER TABLE "new_Publication" RENAME TO "Publication";
CREATE UNIQUE INDEX "Publication_doi_key" ON "Publication"("doi");
CREATE UNIQUE INDEX "Publication_openalexId_key" ON "Publication"("openalexId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
