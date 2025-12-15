-- AlterTable
ALTER TABLE "projects"."projects_documents" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "extension" TEXT NOT NULL DEFAULT 'pdf',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Attachment';
