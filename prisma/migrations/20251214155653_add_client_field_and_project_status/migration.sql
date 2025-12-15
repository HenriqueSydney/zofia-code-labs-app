/*
  Warnings:

  - Made the column `trade_name` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organization_id` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "projects"."ProjectStatus" ADD VALUE 'PROPOSAL';
ALTER TYPE "projects"."ProjectStatus" ADD VALUE 'FINAL_PAYMENT';
ALTER TYPE "projects"."ProjectStatus" ADD VALUE 'COMPLETED';

-- DropForeignKey
ALTER TABLE "identity"."users" DROP CONSTRAINT "users_organization_id_fkey";

-- AlterTable
ALTER TABLE "crm"."clients" ALTER COLUMN "trade_name" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "identity"."users" ALTER COLUMN "organization_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "identity"."users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
