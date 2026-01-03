-- CreateEnum
CREATE TYPE "crm"."ClientEmployeeRole" AS ENUM ('ADMIN', 'USER', 'VIEWER');

-- CreateEnum
CREATE TYPE "crm"."ClientEmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

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

-- CreateIndex
CREATE UNIQUE INDEX "client_employees_client_id_userId_key" ON "crm"."client_employees"("client_id", "userId");

-- AddForeignKey
ALTER TABLE "crm"."client_employees" ADD CONSTRAINT "client_employees_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "identity"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."client_employees" ADD CONSTRAINT "client_employees_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "crm"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."client_employees" ADD CONSTRAINT "client_employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "identity"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
