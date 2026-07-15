ALTER TABLE "IngestionError" ADD COLUMN "code" TEXT;
ALTER TABLE "IngestionError" ADD COLUMN "retryable" BOOLEAN NOT NULL DEFAULT false;
