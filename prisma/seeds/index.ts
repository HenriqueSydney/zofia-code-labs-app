import type { PrismaClient } from "@/generated/prisma/client";
import { seedOrganization } from "./01-organization";
import { seedCustomRoles } from "./02-custom-roles";
import { seedUsersAndMembers } from "./03-users-and-members";
import { seedServiceCatalog } from "./04-service-catalog";
import { seedClients } from "./05-clients";
import { seedExpenseCategories } from "./06-expense-categories";
import { seedIntegrationTypes } from "./07-integration-types";
import { seedProjects } from "./08-projects";
import { seedZofiaErpProject } from "./09-zofia-erp";
import { seedMockData } from "./10-mock-data";
import type { SeedContext } from "./types";

export async function runSeeds(prisma: PrismaClient): Promise<SeedContext> {
  console.log("🌱 Iniciando seed Zofia Code Labs...");

  const organizationId = await seedOrganization(prisma);
  const customRoles = await seedCustomRoles(prisma, organizationId);
  const users = await seedUsersAndMembers(prisma, organizationId, customRoles);
  const categoryMap = await seedServiceCatalog(prisma, organizationId);

  await seedClients(prisma, organizationId);
  await seedExpenseCategories(prisma, organizationId);
  await seedIntegrationTypes(prisma);
  await seedProjects(prisma, organizationId, users.cristina);
  await seedZofiaErpProject(prisma, organizationId, users.henrique);
  await seedMockData(prisma, organizationId, users);

  console.log("🏁 Seed Zofia Code Labs finalizado!");

  return {
    organizationId,
    customRoles,
    categoryMap,
    users,
  };
}
