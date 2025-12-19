/*
  Warnings:

  - You are about to drop the column `aprovedAt` on the `proposals` table. All the data in the column will be lost.
  - You are about to drop the column `aproved_by` on the `proposals` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "crm"."proposals" DROP CONSTRAINT "proposals_aproved_by_fkey";

-- AlterTable
ALTER TABLE "crm"."proposals" DROP COLUMN "aprovedAt",
DROP COLUMN "aproved_by",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approved_by" TEXT;

-- AddForeignKey
ALTER TABLE "crm"."proposals" ADD CONSTRAINT "proposals_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
