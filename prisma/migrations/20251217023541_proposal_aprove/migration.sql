-- AlterTable
ALTER TABLE "crm"."proposals" ADD COLUMN     "aprovedAt" TIMESTAMP(3),
ADD COLUMN     "aproved_by" TEXT;

-- AddForeignKey
ALTER TABLE "crm"."proposals" ADD CONSTRAINT "proposals_aproved_by_fkey" FOREIGN KEY ("aproved_by") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
