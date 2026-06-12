-- AlterTable
ALTER TABLE "crm"."clients" ADD COLUMN "responsible_name" VARCHAR(200),
ADD COLUMN "responsible_email" VARCHAR(255),
ADD COLUMN "responsible_phone" VARCHAR(20);
