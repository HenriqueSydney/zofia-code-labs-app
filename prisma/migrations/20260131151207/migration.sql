-- AlterTable
ALTER TABLE "identity"."users" ADD COLUMN     "customRoleId" TEXT,
ADD COLUMN     "specificPermissions" TEXT[];

-- CreateTable
CREATE TABLE "identity"."custom_role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "permissions" TEXT[],

    CONSTRAINT "custom_role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_role_name_organizationId_key" ON "identity"."custom_role"("name", "organizationId");

-- AddForeignKey
ALTER TABLE "identity"."users" ADD CONSTRAINT "users_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES "identity"."custom_role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity"."custom_role" ADD CONSTRAINT "custom_role_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "identity"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
