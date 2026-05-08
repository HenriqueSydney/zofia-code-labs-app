-- CreateTable
CREATE TABLE "projects"."project_ratings" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "tech_quality" INTEGER,
    "communication" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_ratings_project_id_key" ON "projects"."project_ratings"("project_id");

-- CreateIndex
CREATE INDEX "project_ratings_project_id_idx" ON "projects"."project_ratings"("project_id");

-- CreateIndex
CREATE INDEX "project_members_left_at_idx" ON "projects"."project_members"("left_at");

-- CreateIndex
CREATE INDEX "projects_documents_projectId_idx" ON "projects"."projects_documents"("projectId");

-- AddForeignKey
ALTER TABLE "projects"."project_ratings" ADD CONSTRAINT "project_ratings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
