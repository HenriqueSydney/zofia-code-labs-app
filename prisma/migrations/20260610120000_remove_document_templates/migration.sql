-- Remove catálogo DocumentTemplate; mantém snapshots de proposta/contrato desacoplados.

UPDATE "crm"."proposals" SET "source_type" = 'MANUAL_UPLOAD' WHERE "source_type" = 'SYSTEM_TEMPLATE';
UPDATE "crm"."contracts" SET "source_type" = 'MANUAL_UPLOAD' WHERE "source_type" = 'SYSTEM_TEMPLATE';

ALTER TABLE "crm"."proposal_templates" DROP CONSTRAINT IF EXISTS "proposal_templates_documentTemplateId_fkey";
ALTER TABLE "crm"."contract_templates" DROP CONSTRAINT IF EXISTS "contract_templates_documentTemplateId_fkey";

ALTER TABLE "crm"."proposal_templates" DROP COLUMN IF EXISTS "documentTemplateId";
ALTER TABLE "crm"."contract_templates" DROP COLUMN IF EXISTS "documentTemplateId";

ALTER TABLE "crm"."proposal_templates" ALTER COLUMN "content" DROP NOT NULL;
ALTER TABLE "crm"."contract_templates" ALTER COLUMN "content" DROP NOT NULL;

DROP TABLE IF EXISTS "catalog"."document_templates";

DROP TYPE IF EXISTS "catalog"."TemplateType";

ALTER TYPE "crm"."ProposalSource" RENAME TO "ProposalSource_old";
CREATE TYPE "crm"."ProposalSource" AS ENUM ('MANUAL_UPLOAD');
ALTER TABLE "crm"."proposals" ALTER COLUMN "source_type" DROP DEFAULT;
ALTER TABLE "crm"."proposals"
  ALTER COLUMN "source_type" TYPE "crm"."ProposalSource"
  USING ("source_type"::text::"crm"."ProposalSource");
ALTER TABLE "crm"."proposals" ALTER COLUMN "source_type" SET DEFAULT 'MANUAL_UPLOAD';
DROP TYPE "crm"."ProposalSource_old";

ALTER TYPE "crm"."ContractSource" RENAME TO "ContractSource_old";
CREATE TYPE "crm"."ContractSource" AS ENUM ('MANUAL_UPLOAD');
ALTER TABLE "crm"."contracts" ALTER COLUMN "source_type" DROP DEFAULT;
ALTER TABLE "crm"."contracts"
  ALTER COLUMN "source_type" TYPE "crm"."ContractSource"
  USING ("source_type"::text::"crm"."ContractSource");
ALTER TABLE "crm"."contracts" ALTER COLUMN "source_type" SET DEFAULT 'MANUAL_UPLOAD';
DROP TYPE "crm"."ContractSource_old";
