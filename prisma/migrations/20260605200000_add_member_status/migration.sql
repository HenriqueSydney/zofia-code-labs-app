-- CreateEnum
CREATE TYPE "identity"."MemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- AlterTable
ALTER TABLE "identity"."members" ADD COLUMN "status" "identity"."MemberStatus" NOT NULL DEFAULT 'ACTIVE';
