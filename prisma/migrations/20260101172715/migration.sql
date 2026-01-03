/*
  Warnings:

  - You are about to drop the column `budget` on the `projects` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "financial"."BudgetEntryType" AS ENUM ('INITIAL', 'ADJUSTMENT', 'REDUCTION', 'REFUND');

-- AlterTable
ALTER TABLE "catalog"."service_types" ALTER COLUMN "base_price" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "crm"."proposal_items" ALTER COLUMN "price" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "discount" SET DATA TYPE DECIMAL(15,2),
ALTER COLUMN "finalPrice" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "crm"."proposals" ALTER COLUMN "total_value" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "financial"."invoices" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "projects"."projects" DROP COLUMN "budget",
ADD COLUMN     "remainingBudget" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "totalBudget" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN     "totalSpent" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "financial"."project_budget_entries" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "financial"."BudgetEntryType" NOT NULL DEFAULT 'INITIAL',
    "description" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "consumedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "remainingBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_budget_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial"."expense_category" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "expense_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial"."project_expenses" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "expenseCategoryId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_budget_entries_projectId_idx" ON "financial"."project_budget_entries"("projectId");

-- CreateIndex
CREATE INDEX "project_expenses_projectId_idx" ON "financial"."project_expenses"("projectId");

-- AddForeignKey
ALTER TABLE "financial"."project_budget_entries" ADD CONSTRAINT "project_budget_entries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."project_budget_entries" ADD CONSTRAINT "project_budget_entries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."expense_category" ADD CONSTRAINT "expense_category_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."project_expenses" ADD CONSTRAINT "project_expenses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."project_expenses" ADD CONSTRAINT "project_expenses_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."project_expenses" ADD CONSTRAINT "project_expenses_expenseCategoryId_fkey" FOREIGN KEY ("expenseCategoryId") REFERENCES "financial"."expense_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
