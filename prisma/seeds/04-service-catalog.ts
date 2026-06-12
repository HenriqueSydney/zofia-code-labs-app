import type { PrismaClient } from "@/generated/prisma/client";
import { serviceDefaultBacklogs } from "./data/service-default-backlogs";
import { log } from "./utils";

const categoriesData = [
  {
    name: "Desenvolvimento de Software",
    taxCode: "1.01",
    key: "DEV",
    description:
      "Criação de sites, sistemas, landing pages e integrações personalizadas.",
  },
  {
    name: "Suporte e Manutenção Técnica",
    taxCode: "1.07",
    key: "SUP",
    description: "Manutenção corretiva, preventiva e suporte continuado.",
  },
  {
    name: "Infraestrutura e Configuração",
    taxCode: "1.03",
    key: "INFRA",
    description: "Configuração de servidores, otimização e DevOps.",
  },
];

const services = [
  {
    catKey: "DEV",
    name: "Landing Page Express (Template Otimizado)",
    basePrice: 890.0,
    description: `Página única ideal para capturar leads ou promover um produto específico.\n- Baseada em templates de alta performance da Zofia Labs.\n- Hospedagem Gratuita inclusa (Cloudflare).\n- Botão direto para WhatsApp e Formulário simples.\n- Entrega em até 5 dias úteis.`,
  },
  {
    catKey: "DEV",
    name: "Site Institucional PME (Até 5 páginas)",
    basePrice: 2400.0,
    description: `Site profissional para pequenas e médias empresas passarem credibilidade.\n- Home, Quem Somos, Serviços, Galeria/Portfólio e Contato.\n- Painel administrativo simples para editar textos (CMS).\n- Otimizado para aparecer no Google (SEO Básico).`,
  },
  {
    catKey: "DEV",
    name: "E-commerce Simples / Catálogo Digital",
    basePrice: 3500.0,
    description: `Loja virtual ou catálogo para exposição de produtos.\n- Integração com gateway de pagamento (Mercado Pago/Stripe).\n- Cálculo de frete simples.\n- Gestão de produtos e pedidos.`,
  },
  {
    catKey: "SUP",
    name: "Hora Técnica de Desenvolvimento (Fullstack)",
    basePrice: 120.0,
    description: `Desenvolvimento de funcionalidades específicas, correção de bugs ou ajustes em sistemas existentes (PHP, Node, React).`,
  },
  {
    catKey: "INFRA",
    name: "Setup de Infraestrutura Cloud (Básico)",
    basePrice: 600.0,
    description: `Configuração inicial de servidor VPS ou Cloud.\n- Instalação de Docker, Nginx e Certificado SSL (HTTPS).\n- Apontamento de domínio.\n- Ideal para quem já tem o código mas não sabe colocar no ar.`,
  },
  {
    catKey: "INFRA",
    name: "Otimização de Performance Web (Speed Up)",
    basePrice: 450.0,
    description: `Seu site está lento? Otimização técnica para melhorar a nota no Google PageSpeed.\n- Compressão de imagens.\n- Configuração de Cache e CDN.\n- Minificação de códigos CSS/JS.`,
  },
  {
    catKey: "DEV",
    name: "MVP para Startups (Escopo Fechado)",
    basePrice: 7500.0,
    description: `Desenvolvimento do núcleo do seu projeto para validação de mercado.\n- Foco estrito nas funcionalidades principais.\n- Tecnologia escalável (Next.js) que permite crescimento futuro.\n- Entrega ágil em sprints quinzenais.`,
  },
  {
    catKey: "DEV",
    name: "Integração de APIs (Automação)",
    basePrice: 1500.0,
    description: `Conecte seus sistemas. Ex: Enviar leads do site para o CRM, emitir nota automática, conectar com meios de pagamento.\n- Valor base por integração simples.`,
  },
  {
    catKey: "SUP",
    name: "Manutenção Mensal Básica",
    basePrice: 350.0,
    description: `Garantia de funcionamento e pequenas alterações.\n- Monitoramento de ar (Uptime).\n- Backup semanal.\n- Até 2 horas de ajustes mensais inclusas (alteração de texto/foto).`,
  },
  {
    catKey: "INFRA",
    name: "Consultoria DevOps / Cloud Support",
    basePrice: 800.0,
    description: `Suporte mensal para ambientes em nuvem.\n- Monitoramento de recursos (CPU/RAM).\n- Atualizações de segurança do servidor.\n- Resposta a incidentes.`,
  },
];

export async function seedServiceCatalog(
  prisma: PrismaClient,
  organizationId: string,
): Promise<Record<string, string>> {
  log("📂 Sincronizando categorias de serviço...");
  const categoryMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const existing = await prisma.serviceCategory.findFirst({
      where: { organizationId, name: cat.name },
    });

    const record =
      existing ??
      (await prisma.serviceCategory.create({
        data: {
          organizationId,
          name: cat.name,
          taxCode: cat.taxCode,
          description: cat.description,
        },
      }));

    if (existing) {
      await prisma.serviceCategory.update({
        where: { id: existing.id },
        data: {
          taxCode: cat.taxCode,
          description: cat.description,
        },
      });
    }

    categoryMap[cat.key] = record.id;
    log(`   🏷️ Categoria: ${cat.name} (LC ${cat.taxCode})`);
  }

  log("🛠️ Sincronizando serviços e backlogs padrão...");
  for (const service of services) {
    const categoryId = categoryMap[service.catKey];
    const { catKey: _catKey, ...serviceData } = service;

    let serviceType = await prisma.serviceType.findFirst({
      where: { organizationId, name: serviceData.name },
    });

    if (!serviceType) {
      serviceType = await prisma.serviceType.create({
        data: {
          organizationId,
          categoryId,
          ...serviceData,
        },
      });
      log(`   ✅ Criado: ${serviceData.name}`);
    } else if (!serviceType.categoryId && categoryId) {
      serviceType = await prisma.serviceType.update({
        where: { id: serviceType.id },
        data: { categoryId },
      });
      log(`   🔄 Atualizado Categoria: ${serviceData.name}`);
    } else {
      log(`   ⏭️ Já existe: ${serviceData.name}`);
    }

    await seedServiceDefaultBacklogs(
      prisma,
      organizationId,
      serviceType.id,
      serviceData.name,
    );
  }

  return categoryMap;
}

async function seedServiceDefaultBacklogs(
  prisma: PrismaClient,
  organizationId: string,
  serviceTypeId: string,
  serviceName: string,
): Promise<void> {
  const defaults = serviceDefaultBacklogs[serviceName];
  if (!defaults?.length) return;

  const seedTitles = new Set(defaults.map((item) => item.title));

  const staleItems = await prisma.serviceDefaultBacklogItem.findMany({
    where: {
      organizationId,
      serviceTypeId,
      deletedAt: null,
      title: { notIn: [...seedTitles] },
    },
    select: { id: true, title: true },
  });

  for (const stale of staleItems) {
    const linkedBacklogCount = await prisma.backlogItem.count({
      where: { serviceDefaultBacklogItemId: stale.id },
    });

    if (linkedBacklogCount === 0) {
      await prisma.serviceDefaultBacklogItem.update({
        where: { id: stale.id },
        data: { deletedAt: new Date() },
      });
    }
  }

  for (const item of defaults) {
    const existing = await prisma.serviceDefaultBacklogItem.findFirst({
      where: {
        organizationId,
        serviceTypeId,
        title: item.title,
        deletedAt: null,
      },
    });

    if (existing) {
      await prisma.serviceDefaultBacklogItem.update({
        where: { id: existing.id },
        data: {
          description: item.description,
          order: item.order,
          points: item.points,
          priority: item.priority,
        },
      });
    } else {
      await prisma.serviceDefaultBacklogItem.create({
        data: {
          organizationId,
          serviceTypeId,
          title: item.title,
          description: item.description,
          order: item.order,
          points: item.points,
          priority: item.priority,
        },
      });
    }
  }

  log(`      📋 Backlog padrão: ${defaults.length} itens → ${serviceName}`);
}
