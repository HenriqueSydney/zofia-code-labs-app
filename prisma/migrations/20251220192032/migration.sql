/*
  Warnings:

  - You are about to drop the column `total_value` on the `contracts` table. All the data in the column will be lost.
  - You are about to drop the column `valid_until` on the `contracts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "crm"."contracts" DROP COLUMN "total_value",
DROP COLUMN "valid_until";
