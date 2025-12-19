/*
  Warnings:

  - You are about to drop the `proposal_items_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `proposals_history` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[project_id,version]` on the table `proposals` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "crm"."proposal_items_history" DROP CONSTRAINT "proposal_items_history_proposalHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "crm"."proposal_items_history" DROP CONSTRAINT "proposal_items_history_service_type_id_fkey";

-- DropForeignKey
ALTER TABLE "crm"."proposals_history" DROP CONSTRAINT "proposals_history_aproved_by_fkey";

-- DropForeignKey
ALTER TABLE "crm"."proposals_history" DROP CONSTRAINT "proposals_history_created_by_fkey";

-- DropForeignKey
ALTER TABLE "crm"."proposals_history" DROP CONSTRAINT "proposals_history_project_id_fkey";

-- DropForeignKey
ALTER TABLE "crm"."proposals_history" DROP CONSTRAINT "proposals_history_reviewed_by_fkey";

-- DropForeignKey
ALTER TABLE "crm"."proposals_history" DROP CONSTRAINT "proposals_history_template_id_fkey";

-- AlterTable
ALTER TABLE "crm"."proposals" ADD COLUMN     "is_current" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "crm"."proposal_items_history";

-- DropTable
DROP TABLE "crm"."proposals_history";

-- CreateIndex
CREATE UNIQUE INDEX "proposals_project_id_version_key" ON "crm"."proposals"("project_id", "version");
