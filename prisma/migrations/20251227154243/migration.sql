/*
  Warnings:

  - Made the column `points` on table `backlog_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `priority` on table `backlog_items` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "projects"."backlog_items" ALTER COLUMN "points" SET NOT NULL,
ALTER COLUMN "priority" SET NOT NULL;
