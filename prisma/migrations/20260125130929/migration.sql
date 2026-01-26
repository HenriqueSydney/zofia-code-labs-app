/*
  Warnings:

  - You are about to drop the column `repository_url` on the `projects` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "projects"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "projects"."ProjectHealth" AS ENUM ('ON_TRACK', 'AT_RISK', 'OFF_TRACK');

-- AlterTable
ALTER TABLE "projects"."projects" DROP COLUMN "repository_url",
ADD COLUMN     "estimated_start_date" TIMESTAMP(3),
ADD COLUMN     "health" "projects"."ProjectHealth" NOT NULL DEFAULT 'ON_TRACK',
ADD COLUMN     "priority" "projects"."Priority" NOT NULL DEFAULT 'MEDIUM';
