/*
  Warnings:

  - You are about to drop the column `description` on the `proposal_items` table. All the data in the column will be lost.
  - You are about to drop the column `client_id` on the `proposals` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "crm"."proposals" DROP CONSTRAINT "proposals_client_id_fkey";

-- AlterTable
ALTER TABLE "crm"."proposal_items" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "crm"."proposals" DROP COLUMN "client_id";
