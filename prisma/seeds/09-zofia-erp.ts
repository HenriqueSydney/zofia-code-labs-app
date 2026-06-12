import type { PrismaClient } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import { generateSlug } from "@/utils/generateSlug";
import {
  ERP_PROJECT_NAME,
  ZOFIA_CLIENT_SLUG,
  erpBacklogItems,
} from "./data/erp-backlog-data";
import { log } from "./utils";

const ZOFIA_CNPJ = "53.203.636/0001-84";

export async function seedZofiaErpProject(
  prisma: PrismaClient,
  organizationId: string,
  createdByUserId: string,
): Promise<void> {
  log("🏭 Sincronizando cliente e projeto ERP Zofia Code Labs...");

  const clientSlug = ZOFIA_CLIENT_SLUG;

  const client = await prisma.client.upsert({
    where: { slug: clientSlug },
    update: {
      companyName: "ZOFIA CODE LABS LTDA",
      tradeName: "ZOFIA CODE LABS",
      cnpj: ZOFIA_CNPJ,
      email: "contato@zofiacodelabs.com",
      phone: "(61) 99999-0000",
      address:
        "Rua 18, S/N, Lote 15, Apt 204, Sul (Águas Claras), Brasília - DF, CEP 71940-540",
      responsibleName: "Maria Cristina Araújo Silva Cruz",
      responsibleEmail: "mcristinaas.cruz@gmail.com",
      responsiblePhone: "(61) 99999-0000",
    },
    create: {
      organizationId,
      slug: clientSlug,
      companyName: "ZOFIA CODE LABS LTDA",
      tradeName: "ZOFIA CODE LABS",
      cnpj: ZOFIA_CNPJ,
      email: "contato@zofiacodelabs.com",
      phone: "(61) 99999-0000",
      address:
        "Rua 18, S/N, Lote 15, Apt 204, Sul (Águas Claras), Brasília - DF, CEP 71940-540",
      responsibleName: "Maria Cristina Araújo Silva Cruz",
      responsibleEmail: "mcristinaas.cruz@gmail.com",
      responsiblePhone: "(61) 99999-0000",
    },
  });

  log(`   ✅ Cliente: ${client.tradeName}`);

  const projectSlug = generateSlug({ title: ERP_PROJECT_NAME });

  const projectDescription = `Mini ERP / painel operacional multi-organização (tenant) para software houses.

Centraliza CRM, ciclo de vida de projetos, documentos comerciais (propostas e contratos), controle financeiro, backlog, dashboards e integrações técnicas (GitHub, SonarQube, Umami, Documenso, Infisical, Resend).

Objetivos:
• Vender e formalizar — do registro do cliente até contrato assinado com rastreabilidade.
• Executar e medir — status, backlog, despesas/receitas e métricas de engenharia.
• Servir como memória organizacional dos projetos executados.

Stack: Next.js 16 (App Router), React 19, TypeScript, PostgreSQL/Prisma 7, Auth.js v5, TipTap, AWS S3/R2, OpenTelemetry.

Projeto piloto CEUB — Projeto Integrador III / Sistematização 1 (2026).`;

  const project = await prisma.project.upsert({
    where: { slug: projectSlug },
    update: {
      name: ERP_PROJECT_NAME,
      description: projectDescription,
      clientId: client.id,
      status: "IN_PROGRESS",
      health: "ON_TRACK",
      priority: "HIGH",
      tags: [
        "Next.js",
        "Prisma",
        "RBAC",
        "Multi-tenant",
        "Desenvolvimento Interno",
      ],
    },
    create: {
      organizationId,
      name: ERP_PROJECT_NAME,
      slug: projectSlug,
      description: projectDescription,
      clientId: client.id,
      status: "IN_PROGRESS",
      health: "ON_TRACK",
      createdBy: createdByUserId,
      estimatedStartDate: date("2025-12-11").toDate(),
      startDate: date("2025-12-11").toDate(),
      priority: "HIGH",
      totalBudget: 0,
      totalSpent: 0,
      remainingBudget: 0,
      tags: [
        "Next.js",
        "Prisma",
        "RBAC",
        "Multi-tenant",
        "Desenvolvimento Interno",
      ],
    },
  });

  log(`   ✅ Projeto: ${project.name}`);

  const mvpService = await prisma.serviceType.findFirst({
    where: {
      organizationId,
      name: "MVP para Startups (Escopo Fechado)",
    },
  });

  if (mvpService) {
    await prisma.projectServices.upsert({
      where: {
        projectId_serviceTypeId: {
          projectId: project.id,
          serviceTypeId: mvpService.id,
        },
      },
      update: {},
      create: {
        projectId: project.id,
        serviceTypeId: mvpService.id,
      },
    });
    log(`      🔗 Vinculado ao serviço: ${mvpService.name}`);
  }

  log("📋 Sincronizando backlog do ERP...");
  for (const item of erpBacklogItems) {
    const existing = await prisma.backlogItem.findFirst({
      where: {
        projectId: project.id,
        title: item.title,
        deletedAt: null,
      },
    });

    const backlogItem =
      existing ??
      (await prisma.backlogItem.create({
        data: {
          organizationId,
          projectId: project.id,
          title: item.title,
          description: item.description,
          status: item.status,
          priority: item.priority,
          points: item.points,
          order: item.order,
        },
      }));

    if (existing) {
      await prisma.backlogItem.update({
        where: { id: existing.id },
        data: {
          description: item.description,
          status: item.status,
          priority: item.priority,
          points: item.points,
          order: item.order,
        },
      });
    }

    if (item.checklist?.length) {
      await prisma.backlogItemChecklistItem.deleteMany({
        where: { backlogItemId: backlogItem.id },
      });

      await prisma.backlogItemChecklistItem.createMany({
        data: item.checklist.map((description, index) => ({
          backlogItemId: backlogItem.id,
          description,
          order: index + 1,
        })),
      });
    }

    log(
      `   ${existing ? "🔄" : "✅"} Backlog: ${item.title} (${item.checklist?.length ?? 0} checklist)`,
    );
  }

  log("   🏁 Projeto ERP e backlog sincronizados!");
}
