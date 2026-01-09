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

-- CreateIndex
CREATE INDEX "umami_metric_snapshots_projectId_timestamp_idx" ON "integrations"."umami_metric_snapshots"("projectId", "timestamp" DESC);

-- AddForeignKey
ALTER TABLE "integrations"."umami_metric_snapshots" ADD CONSTRAINT "umami_metric_snapshots_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
