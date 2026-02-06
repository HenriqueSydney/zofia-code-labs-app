-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audit";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "catalog";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "crm";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "financial";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "identity";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "integrations";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "projects";

-- CreateEnum
CREATE TYPE "identity"."Role" AS ENUM ('OWNER', 'USER');

-- CreateEnum
CREATE TYPE "identity"."IndustryType" AS ENUM ('SOFTWARE_HOUSE', 'MARKETING_AGENCY', 'ARCHITECTURE_FIRM', 'LEGAL', 'CONSULTING_GENERAL');

-- CreateEnum
CREATE TYPE "identity"."MemberRole" AS ENUM ('TENANT_ADMIN', 'TENANT_MEMBER', 'TENANT_OBSERVER');

-- CreateEnum
CREATE TYPE "catalog"."TemplateType" AS ENUM ('CONTRACT', 'PROPOSAL', 'DELIVERY_TERM', 'OTHER');

-- CreateEnum
CREATE TYPE "crm"."ClientEmployeeRole" AS ENUM ('ADMIN', 'USER', 'VIEWER');

-- CreateEnum
CREATE TYPE "crm"."ClientEmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "crm"."ProposalStatus" AS ENUM ('DRAFT', 'REVIEW', 'SENT', 'APPROVED', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "crm"."ProposalSource" AS ENUM ('SYSTEM_TEMPLATE', 'MANUAL_UPLOAD');

-- CreateEnum
CREATE TYPE "crm"."DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "crm"."ContractStatus" AS ENUM ('DRAFT', 'REVIEW', 'SENT', 'SIGNED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "crm"."ContractSource" AS ENUM ('SYSTEM_TEMPLATE', 'MANUAL_UPLOAD');

-- CreateEnum
CREATE TYPE "projects"."ProjectStatus" AS ENUM ('DRAFT', 'TECH_ANALYSIS', 'PROPOSAL', 'PROPOSAL_GENERATED', 'WAITING_SIGNATURE', 'WAITING_DOWN_PAYMENT', 'PLANNED', 'IN_PROGRESS', 'REVIEW', 'ON_HOLD', 'DELIVERED', 'FINAL_PAYMENT', 'COMPLETED', 'CANCELLED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "projects"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "projects"."ProjectHealth" AS ENUM ('ON_TRACK', 'AT_RISK', 'OFF_TRACK');

-- CreateEnum
CREATE TYPE "projects"."BacklogPriority" AS ENUM ('URGENT', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "projects"."BacklogStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELED');

-- CreateEnum
CREATE TYPE "financial"."BudgetEntryType" AS ENUM ('INITIAL', 'ADJUSTMENT', 'REDUCTION', 'REFUND');

-- CreateEnum
CREATE TYPE "financial"."ExpenseNature" AS ENUM ('OPERATIONAL', 'DIRECT_PROJECT', 'INVESTMENT', 'PERSONAL');

-- CreateEnum
CREATE TYPE "financial"."ExpenseStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "financial"."FinancialStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "financial"."InternetBankingProvider" AS ENUM ('CORA', 'PAYPAL', 'MERCADO_PAGO', 'STRIPE');

-- CreateEnum
CREATE TYPE "financial"."PaymentType" AS ENUM ('PIX', 'BOLETO', 'CREDIT_CARD', 'DEBIT_CARD');

-- CreateEnum
CREATE TYPE "financial"."JobType" AS ENUM ('EMIT_NFSE', 'GENERATE_CONTRACT_PDF', 'SEND_EMAIL_REMINDER');

-- CreateEnum
CREATE TYPE "financial"."JobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "integrations"."IntegrationStatus" AS ENUM ('HEALTHY', 'WARNNING', 'ERROR');

-- CreateTable
CREATE TABLE "identity"."organizations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "cnpj" VARCHAR(20),
    "logoUrl" TEXT,
    "industry" "identity"."IndustryType" NOT NULL DEFAULT 'SOFTWARE_HOUSE',
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."users" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "email_verified" TIMESTAMP(3),
    "password_hash" TEXT,
    "image" TEXT,
    "role" "identity"."Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."members" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "role" "identity"."MemberRole" NOT NULL DEFAULT 'TENANT_MEMBER',
    "custom_role_id" TEXT,
    "specificPermissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."custom_role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "permissions" TEXT[],

    CONSTRAINT "custom_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."accounts" (
    "userId" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "provider_account_id" VARCHAR(100) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" VARCHAR(50),
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider","provider_account_id")
);

-- CreateTable
CREATE TABLE "identity"."LoginHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity"."sessions" (
    "sessionToken" VARCHAR(255) NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "identity"."verification_tokens" (
    "identifier" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "catalog"."service_categories" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "tax_code" VARCHAR(20),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."service_types" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "base_price" DECIMAL(15,2),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."service_default_backlog_item" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "order" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "priority" "projects"."BacklogPriority" NOT NULL DEFAULT 'LOW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "service_default_backlog_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."document_templates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "content" JSONB NOT NULL,
    "type" "catalog"."TemplateType" NOT NULL,
    "isSystem" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."clients" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "company_name" VARCHAR(200) NOT NULL,
    "trade_name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "cnpj" VARCHAR(18) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "address" TEXT,
    "logoReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."client_employees" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "permission_role" "crm"."ClientEmployeeRole" NOT NULL,
    "job_title" VARCHAR(100) NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "crm"."ClientEmployeeStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "client_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."proposals" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "status" "crm"."ProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "total_value" DECIMAL(15,2) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "source_type" "crm"."ProposalSource" NOT NULL DEFAULT 'SYSTEM_TEMPLATE',
    "downPaymentPercentage" SMALLINT NOT NULL DEFAULT 30,
    "file_key" TEXT,
    "file_url" TEXT,
    "project_id" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approved_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."proposal_templates" (
    "id" TEXT NOT NULL,
    "documentTemplateId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "proposal_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."proposal_items" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "service_type_id" TEXT NOT NULL,
    "price" DECIMAL(15,2) NOT NULL,
    "discount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "discount_type" "crm"."DiscountType" NOT NULL DEFAULT 'FIXED',
    "finalPrice" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "proposal_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."contracts" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "proposalId" TEXT NOT NULL,
    "status" "crm"."ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" TEXT NOT NULL,
    "source_type" "crm"."ContractSource" NOT NULL DEFAULT 'SYSTEM_TEMPLATE',
    "file_key" TEXT,
    "file_url" TEXT,
    "external_sign_id" TEXT,
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

-- CreateTable
CREATE TABLE "projects"."projects" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "client_id" TEXT NOT NULL,
    "status" "projects"."ProjectStatus" NOT NULL,
    "priority" "projects"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "health" "projects"."ProjectHealth" NOT NULL DEFAULT 'ON_TRACK',
    "tags" TEXT[],
    "estimated_start_date" TIMESTAMP(3),
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "totalBudget" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "remainingBudget" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "memberId" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects"."project_roles" (
    "id" TEXT NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500) NOT NULL,

    CONSTRAINT "project_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects"."project_members" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectRolesId" TEXT NOT NULL,
    "allocation" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects"."projects_documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Attachment',
    "extension" TEXT NOT NULL DEFAULT 'pdf',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "document_url_reference" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "projects_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects"."projects_services" (
    "projectId" TEXT NOT NULL,
    "serviceTypeId" TEXT NOT NULL,

    CONSTRAINT "projects_services_pkey" PRIMARY KEY ("projectId","serviceTypeId")
);

-- CreateTable
CREATE TABLE "projects"."project_notes" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "project_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "project_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects"."sprints" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "total_points" INTEGER DEFAULT 0,
    "completed_points" INTEGER DEFAULT 0,
    "completion_percent" DECIMAL(5,2) DEFAULT 0,
    "external_id" VARCHAR(100),
    "external_url" TEXT,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects"."backlog_items" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "status" "projects"."BacklogStatus" NOT NULL DEFAULT 'TODO',
    "order" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "sprintId" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "priority" "projects"."BacklogPriority" NOT NULL DEFAULT 'LOW',
    "assignee_id" TEXT,
    "external_link" TEXT,
    "serviceDefaultBacklogItemId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "backlog_items_pkey" PRIMARY KEY ("id")
);

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
    "nature" "financial"."ExpenseNature" NOT NULL DEFAULT 'OPERATIONAL',
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
    "supplier" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "expenseCategoryId" TEXT NOT NULL,
    "status" "financial"."ExpenseStatus" NOT NULL DEFAULT 'PENDING',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "attachment_url" TEXT,
    "created_by_id" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial"."invoices" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "internetBankingProvider" "financial"."InternetBankingProvider" NOT NULL,
    "paymentType" "financial"."PaymentType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "status" "financial"."FinancialStatus" NOT NULL DEFAULT 'PENDING',
    "description" VARCHAR(255) NOT NULL,
    "nfse_number" VARCHAR(50),
    "nfse_link" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations"."integration_types" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "logo" TEXT,
    "enable_byol" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "externalDocsUrl" TEXT,
    "fieldsSchema" JSONB,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "integration_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations"."organization_integrations" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "integration_type_id" TEXT NOT NULL,
    "enable_byol" BOOLEAN NOT NULL DEFAULT false,
    "lastHealthCheck" TIMESTAMP(3),
    "healthStatus" "integrations"."IntegrationStatus",
    "lastError" TEXT,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations"."project_integrations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "integration_type_id" TEXT NOT NULL,
    "organization_integration_id" TEXT NOT NULL,
    "config" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations"."sonar_metric_snapshots" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bugs" INTEGER NOT NULL,
    "vulnerabilities" INTEGER NOT NULL,
    "codeSmells" INTEGER NOT NULL,
    "coverage" DOUBLE PRECISION NOT NULL,
    "duplications" DOUBLE PRECISION NOT NULL,
    "technicalDebt" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "securityRating" TEXT NOT NULL,
    "blockerViolations" INTEGER NOT NULL DEFAULT 0,
    "criticalViolations" INTEGER NOT NULL DEFAULT 0,
    "majorViolations" INTEGER NOT NULL DEFAULT 0,
    "minorViolations" INTEGER NOT NULL DEFAULT 0,
    "infoViolations" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sonar_metric_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations"."sonar_quality_gate_conditions" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "threshold" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "sonar_quality_gate_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations"."umami_metric_snapshots" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pageviews" INTEGER NOT NULL DEFAULT 0,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "bounceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTime" INTEGER NOT NULL DEFAULT 0,
    "avgDuration" INTEGER NOT NULL DEFAULT 0,
    "pagesPerSession" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "breakdown" JSONB,

    CONSTRAINT "umami_metric_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations"."webhook_logs" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit"."audit_logs" (
    "idString" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB,
    "metadata" JSONB,
    "user_id" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("idString")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "identity"."organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "identity"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "members_user_id_organization_id_key" ON "identity"."members"("user_id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "custom_role_name_organizationId_key" ON "identity"."custom_role"("name", "organizationId");

-- CreateIndex
CREATE INDEX "LoginHistory_userId_idx" ON "identity"."LoginHistory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "identity"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "clients_slug_key" ON "crm"."clients"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "clients_organization_id_cnpj_key" ON "crm"."clients"("organization_id", "cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "client_employees_client_id_userId_key" ON "crm"."client_employees"("client_id", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_project_id_version_key" ON "crm"."proposals"("project_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_templates_proposal_id_key" ON "crm"."proposal_templates"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_project_id_version_key" ON "crm"."contracts"("project_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "contract_templates_contract_id_key" ON "crm"."contract_templates"("contract_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"."projects"("slug");

-- CreateIndex
CREATE INDEX "project_members_projectId_userId_idx" ON "projects"."project_members"("projectId", "userId");

-- CreateIndex
CREATE INDEX "project_members_userId_idx" ON "projects"."project_members"("userId");

-- CreateIndex
CREATE INDEX "project_budget_entries_projectId_idx" ON "financial"."project_budget_entries"("projectId");

-- CreateIndex
CREATE INDEX "project_expenses_projectId_idx" ON "financial"."project_expenses"("projectId");

-- CreateIndex
CREATE INDEX "project_expenses_organization_id_idx" ON "financial"."project_expenses"("organization_id");

-- CreateIndex
CREATE INDEX "project_expenses_status_idx" ON "financial"."project_expenses"("status");

-- CreateIndex
CREATE UNIQUE INDEX "integration_types_slug_key" ON "integrations"."integration_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organization_integrations_organization_id_integration_type__key" ON "integrations"."organization_integrations"("organization_id", "integration_type_id");

-- CreateIndex
CREATE INDEX "sonar_metric_snapshots_projectId_timestamp_idx" ON "integrations"."sonar_metric_snapshots"("projectId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "sonar_metric_snapshots_status_idx" ON "integrations"."sonar_metric_snapshots"("status");

-- CreateIndex
CREATE INDEX "sonar_quality_gate_conditions_snapshotId_idx" ON "integrations"."sonar_quality_gate_conditions"("snapshotId");

-- CreateIndex
CREATE INDEX "umami_metric_snapshots_projectId_timestamp_idx" ON "integrations"."umami_metric_snapshots"("projectId", "timestamp" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_logs_eventId_key" ON "integrations"."webhook_logs"("eventId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit"."audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit"."audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit"."audit_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "identity"."users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."members" ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."members" ADD CONSTRAINT "members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."members" ADD CONSTRAINT "members_custom_role_id_fkey" FOREIGN KEY ("custom_role_id") REFERENCES "identity"."custom_role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."custom_role" ADD CONSTRAINT "custom_role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "identity"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."LoginHistory" ADD CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."service_categories" ADD CONSTRAINT "service_categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."service_types" ADD CONSTRAINT "service_types_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."service_types" ADD CONSTRAINT "service_types_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "catalog"."service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."service_default_backlog_item" ADD CONSTRAINT "service_default_backlog_item_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."service_default_backlog_item" ADD CONSTRAINT "service_default_backlog_item_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "catalog"."service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."document_templates" ADD CONSTRAINT "document_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."clients" ADD CONSTRAINT "clients_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."client_employees" ADD CONSTRAINT "client_employees_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."client_employees" ADD CONSTRAINT "client_employees_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "crm"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."client_employees" ADD CONSTRAINT "client_employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposals" ADD CONSTRAINT "proposals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposals" ADD CONSTRAINT "proposals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposals" ADD CONSTRAINT "proposals_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposals" ADD CONSTRAINT "proposals_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposal_templates" ADD CONSTRAINT "proposal_templates_documentTemplateId_fkey" FOREIGN KEY ("documentTemplateId") REFERENCES "catalog"."document_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposal_templates" ADD CONSTRAINT "proposal_templates_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "crm"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposal_items" ADD CONSTRAINT "proposal_items_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "crm"."proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."proposal_items" ADD CONSTRAINT "proposal_items_service_type_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "catalog"."service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "projects"."projects" ADD CONSTRAINT "projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."projects" ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "crm"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."projects" ADD CONSTRAINT "projects_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "identity"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."project_members" ADD CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."project_members" ADD CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."project_members" ADD CONSTRAINT "project_members_projectRolesId_fkey" FOREIGN KEY ("projectRolesId") REFERENCES "projects"."project_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."projects_documents" ADD CONSTRAINT "projects_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."projects_services" ADD CONSTRAINT "projects_services_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."projects_services" ADD CONSTRAINT "projects_services_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "catalog"."service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."project_notes" ADD CONSTRAINT "project_notes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."project_notes" ADD CONSTRAINT "project_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."sprints" ADD CONSTRAINT "sprints_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."backlog_items" ADD CONSTRAINT "backlog_items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "identity"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."backlog_items" ADD CONSTRAINT "backlog_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."backlog_items" ADD CONSTRAINT "backlog_items_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "projects"."sprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."backlog_items" ADD CONSTRAINT "backlog_items_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."backlog_items" ADD CONSTRAINT "backlog_items_serviceDefaultBacklogItemId_fkey" FOREIGN KEY ("serviceDefaultBacklogItemId") REFERENCES "catalog"."service_default_backlog_item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "financial"."invoices" ADD CONSTRAINT "invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."invoices" ADD CONSTRAINT "invoices_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"."projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial"."invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "crm"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations"."organization_integrations" ADD CONSTRAINT "organization_integrations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations"."organization_integrations" ADD CONSTRAINT "organization_integrations_integration_type_id_fkey" FOREIGN KEY ("integration_type_id") REFERENCES "integrations"."integration_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations"."project_integrations" ADD CONSTRAINT "project_integrations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations"."project_integrations" ADD CONSTRAINT "project_integrations_integration_type_id_fkey" FOREIGN KEY ("integration_type_id") REFERENCES "integrations"."integration_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations"."project_integrations" ADD CONSTRAINT "project_integrations_organization_integration_id_fkey" FOREIGN KEY ("organization_integration_id") REFERENCES "integrations"."organization_integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations"."sonar_metric_snapshots" ADD CONSTRAINT "sonar_metric_snapshots_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations"."sonar_quality_gate_conditions" ADD CONSTRAINT "sonar_quality_gate_conditions_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "integrations"."sonar_metric_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations"."umami_metric_snapshots" ADD CONSTRAINT "umami_metric_snapshots_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
