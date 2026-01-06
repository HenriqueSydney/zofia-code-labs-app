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

-- CreateIndex
CREATE INDEX "sonar_metric_snapshots_projectId_timestamp_idx" ON "integrations"."sonar_metric_snapshots"("projectId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "sonar_metric_snapshots_status_idx" ON "integrations"."sonar_metric_snapshots"("status");

-- CreateIndex
CREATE INDEX "sonar_quality_gate_conditions_snapshotId_idx" ON "integrations"."sonar_quality_gate_conditions"("snapshotId");

-- AddForeignKey
ALTER TABLE "integrations"."sonar_metric_snapshots" ADD CONSTRAINT "sonar_metric_snapshots_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations"."sonar_quality_gate_conditions" ADD CONSTRAINT "sonar_quality_gate_conditions_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "integrations"."sonar_metric_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
