/*
  Warnings:

  - You are about to drop the column `service_type_id` on the `projects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "projects"."projects" DROP CONSTRAINT "projects_service_type_id_fkey";

-- AlterTable
ALTER TABLE "projects"."projects" DROP COLUMN "service_type_id";
