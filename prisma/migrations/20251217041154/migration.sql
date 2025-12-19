-- AlterTable
ALTER TABLE "crm"."proposals" ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewed_by" TEXT;

-- AddForeignKey
ALTER TABLE "crm"."proposals" ADD CONSTRAINT "proposals_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
