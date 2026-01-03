/*
  Warnings:

  - Added the required column `description` to the `backlog_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "projects"."backlog_items" ADD COLUMN     "description" TEXT NOT NULL;
