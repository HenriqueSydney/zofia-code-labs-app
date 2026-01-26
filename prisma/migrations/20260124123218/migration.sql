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

-- AddForeignKey
ALTER TABLE "catalog"."service_default_backlog_item" ADD CONSTRAINT "service_default_backlog_item_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog"."service_default_backlog_item" ADD CONSTRAINT "service_default_backlog_item_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "catalog"."service_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
