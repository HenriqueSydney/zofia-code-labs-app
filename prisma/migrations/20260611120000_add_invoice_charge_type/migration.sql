-- CreateEnum
CREATE TYPE "financial"."InvoiceChargeType" AS ENUM ('STANDARD', 'DOWN_PAYMENT');

-- AlterTable
ALTER TABLE "financial"."invoices"
ADD COLUMN "charge_type" "financial"."InvoiceChargeType" NOT NULL DEFAULT 'STANDARD';

-- Backfill: faturas de entrada criadas antes do campo tipado
UPDATE "financial"."invoices"
SET "charge_type" = 'DOWN_PAYMENT'
WHERE "description" LIKE 'Entrada —%';
