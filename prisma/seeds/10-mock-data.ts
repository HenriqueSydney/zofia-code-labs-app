import type { PrismaClient } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import { generateSlug } from "@/utils/generateSlug";
import {
  backlogTaskTemplates,
  getMockBacklogTimeline,
  getMockObservationDate,
  getMockProjectTimeline,
  mockClients,
  mockProjectStatuses,
  mockProjectTemplates,
  MOCK_SEED_YEAR,
  observationTemplates,
  resolveBacklogStatusForProject,
} from "./data/mock-seed-data";
import type { UserIds } from "./types";
import { log } from "./utils";

const MOCK_PROJECT_COUNT = 20;
const BACKLOG_ITEMS_PER_PROJECT = 20;
const OBSERVATIONS_PER_PROJECT = 4;

export async function seedMockData(
  prisma: PrismaClient,
  organizationId: string,
  users: UserIds,
): Promise<void> {
  log("🎭 Populando dados mockados (clientes, projetos, backlogs, observações)...");

  const serviceTypes = await prisma.serviceType.findMany({
    where: { organizationId },
    select: { id: true, name: true },
  });

  const serviceTypeByName = new Map(
    serviceTypes.map((service) => [service.name, service.id]),
  );

  const expenseCategory = await prisma.expenseCategory.findFirst({
    where: { organizationId, nature: "DIRECT_PROJECT" },
  });

  const createdClients = [];

  for (const clientData of mockClients) {
    const client = await prisma.client.create({
      data: { ...clientData, organizationId },
    });
    createdClients.push(client);
    log(`   ✅ Cliente mock: ${client.tradeName}`);
  }

  let projectIndex = 0;

  for (const client of createdClients) {
    for (const template of mockProjectTemplates) {
      if (projectIndex >= MOCK_PROJECT_COUNT) break;

      const status = mockProjectStatuses[projectIndex];
      const projectName = `${client.tradeName}: ${template.suffix}`;
      const slug = generateSlug({
        title: `mock-${client.slug}-${template.suffix}-${projectIndex + 1}`,
      });

      const timeline = getMockProjectTimeline(
        projectIndex,
        MOCK_PROJECT_COUNT,
        status,
      );
      const { estimatedStart, startDate, endDate, createdAt, updatedAt } =
        timeline;
      const isFinished =
        status === "COMPLETED" || status === "DELIVERED" || status === "ON_HOLD";

      const totalBudget = template.budget;
      const totalSpent = isFinished
        ? Math.round(totalBudget * (0.75 + (projectIndex % 5) * 0.05))
        : Math.round(totalBudget * (0.3 + (projectIndex % 4) * 0.1));

      const project = await prisma.project.create({
        data: {
          organizationId,
          name: projectName,
          slug,
          description: `Projeto mock — ${template.suffix} para ${client.tradeName}. Dados gerados automaticamente para testes de dashboard, backlog e relatórios (${MOCK_SEED_YEAR}).`,
          clientId: client.id,
          status,
          health: status === "ON_HOLD" ? "AT_RISK" : "ON_TRACK",
          priority: projectIndex % 4 === 0 ? "HIGH" : "MEDIUM",
          tags: [...template.tags, "mock-data"],
          estimatedStartDate: estimatedStart,
          startDate,
          endDate,
          totalBudget,
          totalSpent,
          remainingBudget: Math.max(0, totalBudget - totalSpent),
          createdBy: users.cristina,
          createdAt,
          updatedAt,
        },
      });

      const serviceTypeId = serviceTypeByName.get(template.serviceName);

      if (serviceTypeId) {
        await prisma.projectServices.create({
          data: {
            projectId: project.id,
            serviceTypeId,
          },
        });
      }

      const backlogData = backlogTaskTemplates.map((task, itemIndex) => {
        const backlogStatus = resolveBacklogStatusForProject(
          status,
          itemIndex,
          BACKLOG_ITEMS_PER_PROJECT,
        );
        const { createdAt: backlogCreatedAt, updatedAt: backlogUpdatedAt } =
          getMockBacklogTimeline(
            startDate,
            endDate,
            itemIndex,
            BACKLOG_ITEMS_PER_PROJECT,
            backlogStatus,
          );

        return {
          organizationId,
          projectId: project.id,
          title: task.title,
          description: task.description,
          status: backlogStatus,
          order: itemIndex + 1,
          points: task.points,
          priority: task.priority,
          assigneeId:
            itemIndex % 3 === 0
              ? users.henrique
              : itemIndex % 3 === 1
                ? users.ceubMember
                : users.cristina,
          createdAt: backlogCreatedAt,
          updatedAt: backlogUpdatedAt,
        };
      });

      await prisma.backlogItem.createMany({ data: backlogData });

      const backlogItemsWithChecklist = await prisma.backlogItem.findMany({
        where: { projectId: project.id },
        orderBy: { order: "asc" },
        take: 5,
      });

      for (const [checklistIndex, backlogItem] of backlogItemsWithChecklist.entries()) {
        await prisma.backlogItemChecklistItem.createMany({
          data: [
            {
              backlogItemId: backlogItem.id,
              description: "Revisar critérios de aceite com o cliente",
              order: 1,
            },
            {
              backlogItemId: backlogItem.id,
              description: "Validar responsividade em dispositivos móveis",
              order: 2,
            },
            ...(checklistIndex === 0
              ? [
                  {
                    backlogItemId: backlogItem.id,
                    description: "Confirmar deploy em ambiente de staging",
                    order: 3,
                  },
                ]
              : []),
          ],
        });
      }

      const noteAuthors = [users.cristina, users.henrique, users.ceubMember];

      for (let noteIndex = 0; noteIndex < OBSERVATIONS_PER_PROJECT; noteIndex++) {
        const content =
          observationTemplates[
            (projectIndex * OBSERVATIONS_PER_PROJECT + noteIndex) %
              observationTemplates.length
          ];

        await prisma.projectNote.create({
          data: {
            projectId: project.id,
            userId: noteAuthors[noteIndex % noteAuthors.length],
            content,
            createdAt: getMockObservationDate(
              startDate,
              endDate,
              noteIndex,
              OBSERVATIONS_PER_PROJECT,
            ),
          },
        });
      }

      if (status === "IN_PROGRESS") {
        const sprintStart = date(startDate);

        await prisma.sprint.createMany({
          data: [
            {
              projectId: project.id,
              name: "Sprint 1 — Fundação",
              startDate: sprintStart.toDate(),
              endDate: sprintStart.add(14, "day").toDate(),
              status: "CLOSED",
              totalPoints: 21,
              completedPoints: 21,
              completionPercent: 100,
              createdAt: sprintStart.toDate(),
            },
            {
              projectId: project.id,
              name: "Sprint 2 — Entrega",
              startDate: sprintStart.add(15, "day").toDate(),
              endDate: sprintStart.add(29, "day").toDate(),
              status: "OPEN",
              totalPoints: 34,
              completedPoints: 18,
              completionPercent: 52.94,
              createdAt: sprintStart.add(15, "day").toDate(),
            },
          ],
        });
      }

      if (isFinished) {
        await prisma.projectRating.create({
          data: {
            projectId: project.id,
            rating: 4 + (projectIndex % 2),
            comment: "Entrega dentro do prazo e com boa comunicação durante o projeto.",
            techQuality: 4 + (projectIndex % 2),
            communication: 5,
          },
        });

        await prisma.budgetEntry.create({
          data: {
            organizationId,
            projectId: project.id,
            type: "INITIAL",
            description: "Orçamento inicial aprovado na proposta comercial",
            amount: totalBudget,
            consumedAmount: totalSpent,
            remainingBalance: Math.max(0, totalBudget - totalSpent),
            createdBy: users.cristina,
            createdAt: date(startDate).add(1, "day").toDate(),
          },
        });

        if (expenseCategory) {
          await prisma.expense.create({
            data: {
              organizationId,
              projectId: project.id,
              description: "Licença de API e serviços cloud do projeto",
              supplier: "AWS / Vercel",
              amount: Math.round(totalSpent * 0.08),
              expenseCategoryId: expenseCategory.id,
              status: "PAID",
              date: date(startDate).add(10, "day").toDate(),
              paidAt: date(startDate).add(10, "day").toDate(),
              createdById: users.henrique,
              createdAt: date(startDate).add(10, "day").toDate(),
            },
          });
        }
      }

      log(
        `   📁 Projeto mock #${projectIndex + 1}: ${project.name} (${status}, ${date(startDate).format("DD/MM")} → ${endDate ? date(endDate).format("DD/MM") : "em andamento"})`,
      );

      projectIndex++;
    }
  }

  log(
    `   🏁 Mock concluído: ${createdClients.length} clientes, ${projectIndex} projetos, ~${projectIndex * BACKLOG_ITEMS_PER_PROJECT} itens de backlog.`,
  );
}
