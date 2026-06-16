import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import { generateSlug } from "@/utils/generateSlug";
import { log } from "./utils";

export async function seedProjects(
  prisma: PrismaClient,
  organizationId: string,
  createdByUserId: string,
): Promise<void> {
  return;
  /*log("📁 Sincronizando projetos de clientes...");

  const acolheKids = await prisma.client.findFirst({
    where: {
      organizationId,
      slug: generateSlug({ title: "Acolhe Kids" }),
    },
  });

  const gelateria = await prisma.client.findFirst({
    where: {
      organizationId,
      slug: generateSlug({ title: "Gelateria Filo Di Latte" }),
    },
  });

  const berthran = await prisma.client.findFirst({
    where: {
      organizationId,
      slug: generateSlug({ title: "Dr. Berthran Severo" }),
    },
  });

  const projects: Prisma.ProjectUncheckedCreateInput[] = [
    {
      organizationId,
      name: "Acolhe Kids: Plataforma de Conversão e Presença Digital",
      slug: generateSlug({
        title: "Acolhe Kids: Plataforma de Conversão e Presença Digital",
      }),
      description:
        "Desenvolvimento de uma Landing Page de alta performance focada em conversão para a Clínica Acolhe Kids. O projeto priorizou a experiência do usuário (UX) e a velocidade de carregamento, utilizando Next.js com renderização estática para garantir SEO agressivo e baixo tempo de resposta.\n\nA solução incluiu a integração completa com o Google Places para otimização de busca local, além da implementação do Umami Analytics para monitoramento de tráfego focado em privacidade. O design foi concebido para transmitir acolhimento e segurança, alinhado ao público-alvo da clínica.",
      clientId: acolheKids?.id ?? "",
      status: "COMPLETED",
      health: "ON_TRACK",
      createdBy: createdByUserId,
      estimatedStartDate: date("2025-11-08").toDate(),
      startDate: date("2025-11-08").toDate(),
      endDate: date("2025-11-26").toDate(),
      priority: "LOW",
      totalBudget: 0,
      totalSpent: 0,
      remainingBudget: 0,
      tags: ["Nextjs Fullstack", "UI/UX Frontend", "Google Place", "Umami"],
    },
    {
      organizationId,
      name: "Gelateria Filó Di Latte: Experiência Digital Gastronômica",
      slug: generateSlug({
        title: "Gelateria Filó Di Latte: Experiência Digital Gastronômica",
      }),
      description:
        "Criação de interface digital para a Gelateria Filó Di Latte, focada no apelo visual dos produtos e na facilidade de contato via canais digitais. O projeto utilizou o boilerplate de alta performance da Zofia Labs para garantir uma navegação fluida em dispositivos móveis, onde se concentra 90% do tráfego do cliente.\n\nAlém do frontend moderno com Tailwind CSS, o projeto foi construído para operar na Vercel, com deploy automático via sincronização com o GitHub. A estratégia de SEO local foi aplicada para aumentar a visibilidade da loja física em Brasília.",
      clientId: gelateria?.id ?? "",
      status: "COMPLETED",
      health: "ON_TRACK",
      createdBy: createdByUserId,
      estimatedStartDate: date("2025-10-20").toDate(),
      startDate: date("2025-10-25").toDate(),
      endDate: date("2025-11-04").toDate(),
      priority: "LOW",
      totalBudget: 0,
      totalSpent: 0,
      remainingBudget: 0,
      tags: ["Nextjs Fullstack", "UI/UX Frontend", "Google Place", "Umami"],
    },
    {
      organizationId,
      name: "Portal Institucional Dr. Berthran: Autoridade e Agendamento",
      slug: generateSlug({
        title: "Portal Institucional Dr. Berthran: Autoridade e Agendamento",
      }),
      description:
        "Desenvolvimento de site institucional robusto para o Dr. Berthran, visando estabelecer autoridade digital e divulgar seu trabalho, em especial os procedimentos realizados por Cirurgia Robótica Minimamente Invasiva. \n\nO foco técnico reside na otimização de Core Web Vitals para garantir que a página figure entre os primeiros resultados de busca orgânica, utilizando estratégias avançadas de cache e minificação de assets.",
      clientId: berthran?.id ?? "",
      status: "IN_PROGRESS",
      health: "ON_TRACK",
      createdBy: createdByUserId,
      estimatedStartDate: date("2026-02-01").toDate(),
      startDate: date("2026-02-01").toDate(),
      priority: "LOW",
      totalBudget: 0,
      totalSpent: 0,
      remainingBudget: 0,
      tags: ["Nextjs Fullstack", "UI/UX Frontend", "Google Place", "Umami"],
    },
  ];

  for (const projectData of projects) {
    if (!projectData.clientId) {
      log(`   ⚠️ Cliente não encontrado para: ${projectData.name}`);
      continue;
    }

    const project = await prisma.project.upsert({
      where: { slug: projectData.slug },
      update: projectData,
      create: projectData,
    });

    log(`   🔎 Projeto: ${project.name}`);

    let serviceName = "";
    if (project.name.includes("Landing Page")) {
      serviceName = "Landing Page Express (Template Otimizado)";
    } else if (project.name.includes("Portal Institucional")) {
      serviceName = "Site Institucional PME (Até 5 páginas)";
    }

    if (serviceName) {
      const serviceType = await prisma.serviceType.findFirst({
        where: { name: serviceName, organizationId: project.organizationId },
      });

      if (serviceType) {
        await prisma.projectServices.upsert({
          where: {
            projectId_serviceTypeId: {
              projectId: project.id,
              serviceTypeId: serviceType.id,
            },
          },
          update: {},
          create: {
            projectId: project.id,
            serviceTypeId: serviceType.id,
          },
        });
        log(`      🔗 Vinculado ao serviço: ${serviceName}`);
      }
    }
  }*/
}
