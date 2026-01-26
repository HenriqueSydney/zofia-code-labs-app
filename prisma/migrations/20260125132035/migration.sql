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

-- CreateIndex
CREATE INDEX "project_members_projectId_userId_idx" ON "projects"."project_members"("projectId", "userId");

-- CreateIndex
CREATE INDEX "project_members_userId_idx" ON "projects"."project_members"("userId");

-- AddForeignKey
ALTER TABLE "projects"."project_members" ADD CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."project_members" ADD CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects"."project_members" ADD CONSTRAINT "project_members_projectRolesId_fkey" FOREIGN KEY ("projectRolesId") REFERENCES "projects"."project_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
