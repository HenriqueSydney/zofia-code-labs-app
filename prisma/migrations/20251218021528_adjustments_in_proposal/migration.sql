/*
  Warnings:

  - You are about to drop the column `proposal_id` on the `proposal_items_history` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "crm"."proposal_items_history" DROP CONSTRAINT "proposal_items_history_proposal_id_fkey";

-- AlterTable
ALTER TABLE "crm"."proposal_items_history" DROP COLUMN "proposal_id";
