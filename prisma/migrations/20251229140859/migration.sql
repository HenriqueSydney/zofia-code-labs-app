/*
  Warnings:

  - Added the required column `slug` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "projects"."projects" ADD COLUMN     "slug" VARCHAR(200) NOT NULL;
