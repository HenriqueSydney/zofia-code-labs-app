-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "crm"."ProposalStatus" ADD VALUE 'REVIEW';
ALTER TYPE "crm"."ProposalStatus" ADD VALUE 'APPROVED';

-- AlterTable
ALTER TABLE "crm"."proposal_items" ADD COLUMN     "proposalHistoryId" TEXT;

-- CreateTable
CREATE TABLE "crm"."proposals_history" (
    "id" TEXT NOT NULL,
    "status" "crm"."ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "total_value" DECIMAL(10,2) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "source_type" "crm"."ProposalSource" NOT NULL DEFAULT 'SYSTEM_TEMPLATE',
    "template_id" TEXT,
    "file_key" TEXT,
    "file_url" TEXT,
    "project_id" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "aprovedAt" TIMESTAMP(3),
    "aproved_by" TEXT,
    "version" SMALLINT NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proposals_history_project_id_key" ON "crm"."proposals_history"("project_id");

-- AddForeignKey
ALTER TABLE "crm"."proposals_history" ADD CONSTRAINT "proposals_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposals_history" ADD CONSTRAINT "proposals_history_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "crm"."proposal_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposals_history" ADD CONSTRAINT "proposals_history_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposals_history" ADD CONSTRAINT "proposals_history_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposals_history" ADD CONSTRAINT "proposals_history_aproved_by_fkey" FOREIGN KEY ("aproved_by") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposal_items" ADD CONSTRAINT "proposal_items_proposalHistoryId_fkey" FOREIGN KEY ("proposalHistoryId") REFERENCES "crm"."proposals_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;
