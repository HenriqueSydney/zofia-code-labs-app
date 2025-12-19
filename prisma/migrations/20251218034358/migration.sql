/*
  Warnings:

  - You are about to drop the column `template_id` on the `proposals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[proposal_id]` on the table `proposal_templates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `proposal_id` to the `proposal_templates` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "crm"."proposals" DROP CONSTRAINT "proposals_template_id_fkey";

-- DropIndex
DROP INDEX "crm"."proposals_project_id_key";

-- AlterTable
ALTER TABLE "crm"."proposal_templates" ADD COLUMN     "proposal_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "crm"."proposals" DROP COLUMN "template_id";

-- CreateIndex
CREATE UNIQUE INDEX "proposal_templates_proposal_id_key" ON "crm"."proposal_templates"("proposal_id");

-- AddForeignKey
ALTER TABLE "crm"."proposal_templates" ADD CONSTRAINT "proposal_templates_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "crm"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
