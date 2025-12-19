/*
  Warnings:

  - You are about to drop the column `proposalHistoryId` on the `proposal_items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "crm"."proposal_items" DROP CONSTRAINT "proposal_items_proposalHistoryId_fkey";

-- AlterTable
ALTER TABLE "crm"."proposal_items" DROP COLUMN "proposalHistoryId";

-- CreateTable
CREATE TABLE "crm"."proposal_items_history" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "service_type_id" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount_type" "crm"."DiscountType" NOT NULL DEFAULT 'FIXED',
    "finalPrice" DECIMAL(10,2) NOT NULL,
    "proposalHistoryId" TEXT,

    CONSTRAINT "proposal_items_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "crm"."proposal_items_history" ADD CONSTRAINT "proposal_items_history_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "crm"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposal_items_history" ADD CONSTRAINT "proposal_items_history_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "catalog"."service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposal_items_history" ADD CONSTRAINT "proposal_items_history_proposalHistoryId_fkey" FOREIGN KEY ("proposalHistoryId") REFERENCES "crm"."proposals_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;
