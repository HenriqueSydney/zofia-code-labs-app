/*
  Warnings:

  - You are about to drop the column `date` on the `project_expenses` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `project_expenses` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "financial"."ExpenseStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED', 'SCHEDULED');

-- AlterTable
ALTER TABLE "financial"."project_expenses" DROP COLUMN "date",
ADD COLUMN     "attachment_url" TEXT,
ADD COLUMN     "created_by_id" TEXT,
ADD COLUMN     "due_date" TIMESTAMP(3),
ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "status" "financial"."ExpenseStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "supplier" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "project_expenses_organization_id_idx" ON "financial"."project_expenses"("organization_id");

-- CreateIndex
CREATE INDEX "project_expenses_status_idx" ON "financial"."project_expenses"("status");
