/*
  Warnings:

  - The values [REJECTED] on the enum `ContractStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "crm"."ContractStatus_new" AS ENUM ('DRAFT', 'REVIEW', 'SENT', 'SIGNED', 'CANCELLED');
ALTER TABLE "crm"."contracts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "crm"."contracts" ALTER COLUMN "status" TYPE "crm"."ContractStatus_new" USING ("status"::text::"crm"."ContractStatus_new");
ALTER TYPE "crm"."ContractStatus" RENAME TO "ContractStatus_old";
ALTER TYPE "crm"."ContractStatus_new" RENAME TO "ContractStatus";
DROP TYPE "crm"."ContractStatus_old";
ALTER TABLE "crm"."contracts" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;
