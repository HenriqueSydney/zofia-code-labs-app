-- AlterEnum
ALTER TYPE "crm"."ContractStatus" ADD VALUE 'REJECTED';

-- CreateTable
CREATE TABLE "integrations"."webhook_logs" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_logs_eventId_key" ON "integrations"."webhook_logs"("eventId");
