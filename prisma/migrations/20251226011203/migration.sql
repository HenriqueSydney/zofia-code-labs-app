/*
  Warnings:

  - Added the required column `internetBankingProvider` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentType` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `invoices` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "financial"."InternetBankingProvider" AS ENUM ('CORA', 'PAYPAL', 'MERCADO_PAGO', 'STRIPE');

-- CreateEnum
CREATE TYPE "financial"."PaymentType" AS ENUM ('PIX', 'BOLETO', 'CREDIT_CARD', 'DEBIT_CARD');

-- AlterTable
ALTER TABLE "crm"."contracts" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "crm"."proposals" ADD COLUMN     "downPaymentPercentage" SMALLINT NOT NULL DEFAULT 30,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "financial"."invoices" ADD COLUMN     "internetBankingProvider" "financial"."InternetBankingProvider" NOT NULL,
ADD COLUMN     "paymentType" "financial"."PaymentType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
