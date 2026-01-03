/*
  Warnings:

  - The `status` column on the `backlog_items` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `backlog_items` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "projects"."BacklogPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "projects"."BacklogStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE');

-- AlterTable
ALTER TABLE "projects"."backlog_items" DROP COLUMN "status",
ADD COLUMN     "status" "projects"."BacklogStatus" NOT NULL DEFAULT 'TODO',
DROP COLUMN "priority",
ADD COLUMN     "priority" "projects"."BacklogPriority" DEFAULT 'LOW';
