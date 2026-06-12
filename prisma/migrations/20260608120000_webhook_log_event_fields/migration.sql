-- AlterTable
ALTER TABLE "integrations"."webhook_logs"
ADD COLUMN "eventType" TEXT,
ADD COLUMN "documentId" TEXT;

-- Backfill registros legados (eventId antigo = documentId)
UPDATE "integrations"."webhook_logs"
SET
  "eventType" = COALESCE("payload"->>'event', 'UNKNOWN'),
  "documentId" = "eventId"
WHERE "eventType" IS NULL;

ALTER TABLE "integrations"."webhook_logs"
ALTER COLUMN "eventType" SET NOT NULL;

-- CreateIndex
CREATE INDEX "webhook_logs_provider_documentId_idx"
ON "integrations"."webhook_logs"("provider", "documentId");
