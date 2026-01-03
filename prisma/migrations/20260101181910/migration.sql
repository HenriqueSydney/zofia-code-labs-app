-- CreateEnum
CREATE TYPE "financial"."ExpenseNature" AS ENUM ('OPERATIONAL', 'DIRECT_PROJECT', 'INVESTMENT', 'PERSONAL');

-- AlterTable
ALTER TABLE "financial"."expense_category" ADD COLUMN     "nature" "financial"."ExpenseNature" NOT NULL DEFAULT 'OPERATIONAL';
