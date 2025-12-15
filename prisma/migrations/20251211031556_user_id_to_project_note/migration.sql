/*
  Warnings:

  - Added the required column `updated_at` to the `project_notes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `project_notes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "projects"."project_notes" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "projects"."project_notes" ADD CONSTRAINT "project_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
