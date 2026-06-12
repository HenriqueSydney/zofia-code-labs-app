-- CreateTable
CREATE TABLE "projects"."backlog_item_checklist_items" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "client_blocker" TEXT,
    "order" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "backlog_item_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backlog_item_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "backlog_item_checklist_items_backlog_item_id_idx" ON "projects"."backlog_item_checklist_items"("backlog_item_id");

-- AddForeignKey
ALTER TABLE "projects"."backlog_item_checklist_items" ADD CONSTRAINT "backlog_item_checklist_items_backlog_item_id_fkey" FOREIGN KEY ("backlog_item_id") REFERENCES "projects"."backlog_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
