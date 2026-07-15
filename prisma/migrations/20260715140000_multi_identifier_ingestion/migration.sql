ALTER TABLE "IngestionRun" ADD COLUMN "inputType" TEXT NOT NULL DEFAULT 'doi';

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_IngestionError" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runId" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "identifierType" TEXT NOT NULL DEFAULT 'doi',
    "code" TEXT,
    "message" TEXT NOT NULL,
    "retryable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IngestionError_runId_fkey" FOREIGN KEY ("runId") REFERENCES "IngestionRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_IngestionError" (
    "id", "runId", "identifier", "identifierType", "code", "message", "retryable", "createdAt"
)
SELECT "id", "runId", "doi", 'doi', "code", "message", "retryable", "createdAt"
FROM "IngestionError";

DROP TABLE "IngestionError";
ALTER TABLE "new_IngestionError" RENAME TO "IngestionError";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
