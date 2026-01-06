/*
  Warnings:

  - Added the required column `organization_integration_id` to the `project_integrations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "integrations"."project_integrations" ADD COLUMN     "organization_integration_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "integrations"."project_integrations" ADD CONSTRAINT "project_integrations_organization_integration_id_fkey" FOREIGN KEY ("organization_integration_id") REFERENCES "integrations"."organization_integrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
