-- CreateEnum
CREATE TYPE "crm"."ContractStatus" AS ENUM ('DRAFT', 'REVIEW', 'SENT', 'SIGNED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "crm"."ContractSource" AS ENUM ('SYSTEM_TEMPLATE', 'MANUAL_UPLOAD');

-- CreateTable
CREATE TABLE "crm"."contracts" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "proposalId" TEXT NOT NULL,
    "status" "crm"."ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "total_value" DECIMAL(10,2) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "source_type" "crm"."ContractSource" NOT NULL DEFAULT 'SYSTEM_TEMPLATE',
    "file_key" TEXT,
    "file_url" TEXT,
    "project_id" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approved_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."contract_templates" (
    "id" TEXT NOT NULL,
    "documentTemplateId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contract_id" TEXT NOT NULL,

    CONSTRAINT "contract_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contracts_project_id_version_key" ON "crm"."contracts"("project_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "contract_templates_contract_id_key" ON "crm"."contract_templates"("contract_id");

-- AddForeignKey
ALTER TABLE "crm"."contracts" ADD CONSTRAINT "contracts_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "crm"."proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."contracts" ADD CONSTRAINT "contracts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."contracts" ADD CONSTRAINT "contracts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."contracts" ADD CONSTRAINT "contracts_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."contracts" ADD CONSTRAINT "contracts_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."contract_templates" ADD CONSTRAINT "contract_templates_documentTemplateId_fkey" FOREIGN KEY ("documentTemplateId") REFERENCES "catalog"."document_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."contract_templates" ADD CONSTRAINT "contract_templates_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "crm"."contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
