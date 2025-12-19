/*
  Warnings:

  - You are about to drop the column `generated_project_id` on the `proposals` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[project_id]` on the table `proposals` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `project_id` to the `proposals` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "crm"."proposals" DROP CONSTRAINT "proposals_generated_project_id_fkey";

-- DropIndex
DROP INDEX "crm"."proposals_generated_project_id_key";

-- AlterTable
ALTER TABLE "crm"."proposals" DROP COLUMN "generated_project_id",
ADD COLUMN     "project_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "proposals_project_id_key" ON "crm"."proposals"("project_id");

-- AddForeignKey
ALTER TABLE "crm"."proposals" ADD CONSTRAINT "proposals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
