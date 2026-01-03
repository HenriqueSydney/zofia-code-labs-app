/*
  Warnings:

  - Added the required column `organizationId` to the `backlog_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "projects"."backlog_items" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "projects"."backlog_items" ADD CONSTRAINT "backlog_items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "identity"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
