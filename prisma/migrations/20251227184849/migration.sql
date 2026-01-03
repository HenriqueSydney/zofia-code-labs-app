/*
  Warnings:

  - Added the required column `updated_at` to the `backlog_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "projects"."BacklogPriority" ADD VALUE 'URGENT';

-- AlterTable
ALTER TABLE "projects"."backlog_items" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "projects"."backlog_items" ADD CONSTRAINT "backlog_items_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
