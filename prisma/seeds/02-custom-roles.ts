import { PERMISSIONS } from "@/constants/permissions";
import type { PrismaClient } from "@/generated/prisma/client";
import type { CustomRoleIds } from "./types";
import { log, upsertCustomRole } from "./utils";

const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap((group) =>
  Object.values(group),
);

const ALL_PERMISSIONS_WITHOUT_INTEGRATION_MANAGE = ALL_PERMISSIONS.filter(
  (permission) => permission !== PERMISSIONS.SETTINGS.MANAGE_INTEGRATIONS,
);

export async function seedCustomRoles(
  prisma: PrismaClient,
  organizationId: string,
): Promise<CustomRoleIds> {
  log("🔐 Sincronizando perfis de acesso...");

  const admin = await upsertCustomRole(prisma, {
    organizationId,
    name: "Administrador da Empresa",
    description:
      "Acesso total à organização — gestão comercial, financeira, projetos e configurações.",
    permissions: ALL_PERMISSIONS,
  });

  const projectManager = await upsertCustomRole(prisma, {
    organizationId,
    name: "Gerente de Projetos",
    description:
      "Coordenação de projetos, backlog, propostas e visão comercial operacional.",
    permissions: [
      PERMISSIONS.PROJECT.READ,
      PERMISSIONS.PROJECT.READ_OBSERVATIONS,
      PERMISSIONS.PROJECT.READ_RECENT_UPDATES,
      PERMISSIONS.PROJECT.MANAGE,
      PERMISSIONS.PROJECT.CREATE,
      PERMISSIONS.PROJECT.UPDATE,
      PERMISSIONS.PROJECT.ARCHIVE,
      PERMISSIONS.BACKLOG.READ,
      PERMISSIONS.BACKLOG.MANAGE,
      PERMISSIONS.CLIENT.READ,
      PERMISSIONS.CLIENT.CREATE,
      PERMISSIONS.CLIENT.UPDATE,
      PERMISSIONS.PROPOSAL.READ,
      PERMISSIONS.PROPOSAL.CREATE,
      PERMISSIONS.PROPOSAL.SEND,
      PERMISSIONS.CONTRACT.READ,
      PERMISSIONS.CONTRACT.CREATE,
      PERMISSIONS.SERVICE_CATALOG.READ,
      PERMISSIONS.EXPENSE.READ,
      PERMISSIONS.EXPENSE.CREATE,
      PERMISSIONS.INVOICE.READ,
      PERMISSIONS.INVOICE.CREATE,
      PERMISSIONS.FINANCIAL.VIEW_DASHBOARD,
      PERMISSIONS.SETTINGS.READ_INTEGRATIONS,
    ],
  });

  const financialManager = await upsertCustomRole(prisma, {
    organizationId,
    name: "Gestor Financeiro",
    description:
      "Gestão financeira, faturas, despesas e visão de receitas da organização.",
    permissions: [
      PERMISSIONS.FINANCIAL.VIEW_DASHBOARD,
      PERMISSIONS.FINANCIAL.CREATE,
      PERMISSIONS.FINANCIAL.EXPORT,
      PERMISSIONS.INVOICE.READ,
      PERMISSIONS.INVOICE.CREATE,
      PERMISSIONS.INVOICE.CANCEL,
      PERMISSIONS.EXPENSE.READ,
      PERMISSIONS.EXPENSE.CREATE,
      PERMISSIONS.EXPENSE.APPROVE,
      PERMISSIONS.CLIENT.READ,
      PERMISSIONS.PROJECT.READ,
      PERMISSIONS.PROJECT.READ_OBSERVATIONS,
      PERMISSIONS.PROPOSAL.READ,
      PERMISSIONS.CONTRACT.READ,
      PERMISSIONS.SETTINGS.MANAGE_EXPENSE_CATEGORIES,
    ],
  });

  const seniorDeveloper = await upsertCustomRole(prisma, {
    organizationId,
    name: "Desenvolvedor Sênior",
    description: "Desenvolvimento, backlog técnico e integrações de engenharia.",
    permissions: [
      PERMISSIONS.PROJECT.READ,
      PERMISSIONS.PROJECT.CREATE,
      PERMISSIONS.PROJECT.UPDATE,
      PERMISSIONS.BACKLOG.READ,
      PERMISSIONS.BACKLOG.MANAGE,
      PERMISSIONS.CLIENT.READ,
      PERMISSIONS.PROPOSAL.READ,
      PERMISSIONS.CONTRACT.READ,
      PERMISSIONS.SERVICE_CATALOG.READ,
      PERMISSIONS.EXPENSE.READ,
      PERMISSIONS.EXPENSE.CREATE,
      PERMISSIONS.SETTINGS.MANAGE_INTEGRATIONS,
      PERMISSIONS.SETTINGS.READ_INTEGRATIONS,
    ],
  });

  const ceubAdmin = await upsertCustomRole(prisma, {
    organizationId,
    name: "Administrador CEUB (Teste)",
    description:
      "Acesso total à organização, exceto edição de integrações — usuário de teste automatizado.",
    permissions: ALL_PERMISSIONS_WITHOUT_INTEGRATION_MANAGE,
  });

  return { admin, projectManager, financialManager, seniorDeveloper, ceubAdmin };
}
