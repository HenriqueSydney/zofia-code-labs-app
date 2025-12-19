/*
  Warnings:

  - Added the required column `updatedAt` to the `document_templates` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `content` on the `document_templates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `finalPrice` to the `proposal_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `proposals` table without a default value. This is not possible if the table is not empty.
  - Made the column `generated_project_id` on table `proposals` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "crm"."ProposalSource" AS ENUM ('SYSTEM_TEMPLATE', 'MANUAL_UPLOAD');

-- CreateEnum
CREATE TYPE "crm"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterEnum
ALTER TYPE "catalog"."TemplateType" ADD VALUE 'OTHER';

-- DropForeignKey
ALTER TABLE "crm"."proposals" DROP CONSTRAINT "proposals_generated_project_id_fkey";

-- AlterTable
ALTER TABLE "catalog"."document_templates" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "crm"."proposal_items" ADD COLUMN     "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "discount_type" "crm"."DiscountType" NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "finalPrice" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "crm"."proposals" ADD COLUMN     "file_key" TEXT,
ADD COLUMN     "file_url" TEXT,
ADD COLUMN     "source_type" "crm"."ProposalSource" NOT NULL DEFAULT 'SYSTEM_TEMPLATE',
ADD COLUMN     "template_id" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "generated_project_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "crm"."proposal_templates" (
    "id" TEXT NOT NULL,
    "documentTemplateId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_templates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "crm"."proposals" ADD CONSTRAINT "proposals_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "crm"."proposal_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposals" ADD CONSTRAINT "proposals_generated_project_id_fkey" FOREIGN KEY ("generated_project_id") REFERENCES "projects"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposal_templates" ADD CONSTRAINT "proposal_templates_documentTemplateId_fkey" FOREIGN KEY ("documentTemplateId") REFERENCES "catalog"."document_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
