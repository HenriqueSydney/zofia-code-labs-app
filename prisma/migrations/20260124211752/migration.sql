-- AlterTable
ALTER TABLE "projects"."backlog_items" ADD COLUMN     "serviceDefaultBacklogItemId" TEXT;

-- AddForeignKey
ALTER TABLE "projects"."backlog_items" ADD CONSTRAINT "backlog_items_serviceDefaultBacklogItemId_fkey" FOREIGN KEY ("serviceDefaultBacklogItemId") REFERENCES "catalog"."service_default_backlog_item"("id") ON DELETE SET NULL ON UPDATE CASCADE;
