import { Prisma, Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

async function main() {
  console.log("🌱 Iniciando seed Zofia Code Labs...");

  let organization = await prisma.organization.findFirst({
    where: { slug: "zofia-code-labs" },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: "Zofia Code Labs",
        slug: "zofia-code-labs",
        cnpj: "000.000.00/0001-00",
      },
    });
  }

  const users: Prisma.UserUncheckedCreateInput[] = [
    {
      organizationId: organization.id,
      name: "Henrique Sydney Ribeiro Lima",
      email: "henriquesydneylima@gmail.com",
      emailVerified: new Date(),
      role: Role.OWNER,
    },
    {
      organizationId: organization.id,
      name: "Maria Cristina Araújo Silva Cruz",
      email: "mcristinaas.cruz@gmail.com",
      emailVerified: new Date(),
      role: Role.OWNER,
    },
  ];

  for (const user of users) {
    const existing = await prisma.user.findFirst({
      where: { email: user.email },
    });

    if (!existing) {
      await prisma.user.create({
        data: user,
      });
      console.log(`✅ Usuário criado: ${user.name}`);
    } else {
      console.log(`🔄 Usuário já existe: ${user.name}`);
    }
  }

  // ============================================================
  // 1. DEFINIÇÃO DAS CATEGORIAS (Com Códigos LC 116 Comuns)
  // ============================================================
  const categoriesData = [
    {
      name: "Desenvolvimento de Software",
      taxCode: "1.01", // Análise e desenvolvimento de sistemas
      key: "DEV", // Chave auxiliar apenas para o seed organizar
      description:
        "Criação de sites, sistemas, landing pages e integrações personalizadas.",
    },
    {
      name: "Suporte e Manutenção Técnica",
      taxCode: "1.07", // Suporte técnico em informática
      key: "SUP",
      description: "Manutenção corretiva, preventiva e suporte continuado.",
    },
    {
      name: "Infraestrutura e Configuração",
      taxCode: "1.03", // Processamento de dados e congêneres (comum para setups)
      key: "INFRA",
      description: "Configuração de servidores, otimização e DevOps.",
    },
  ];

  // Mapa para guardar os IDs das categorias criadas/encontradas
  const categoryMap: Record<string, string> = {};

  console.log("📂 Sincronizando Categorias...");

  for (const cat of categoriesData) {
    // Upsert garante que não duplica se rodar o seed 2x
    const record = await prisma.serviceCategory.upsert({
      where: {
        // Nota: O ideal seria ter um @unique composto [organizationId, name],
        // mas aqui buscaremos pelo primeiro encontrado para simplificar o exemplo
        id: await prisma.serviceCategory
          .findFirst({
            where: { organizationId: organization.id, name: cat.name },
          })
          .then((r) => r?.id || "novo_id_placeholder"),
      },
      update: {
        taxCode: cat.taxCode,
        description: cat.description,
      },
      create: {
        organizationId: organization.id,
        name: cat.name,
        taxCode: cat.taxCode,
        description: cat.description,
      },
    });

    // Se o upsert acima falhar pela lógica do ID placeholder, use findFirst + create logic simples
    // Mas assumindo sucesso, guardamos o ID:
    categoryMap[cat.key] = record.id;
    console.log(`   🏷️ Categoria: ${cat.name} (LC ${cat.taxCode})`);
  }

  // ============================================================
  // 2. LISTA DE SERVIÇOS VINCULADOS
  // ============================================================
  const services = [
    // --- PRODUTOS DE ENTRADA (DEV) ---
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

    // --- SERVIÇOS TÉCNICOS ---
    {
      catKey: "SUP", // Correção e ajustes geralmente cai em suporte ou dev (1.07 ou 1.01). 1.01 paga menos imposto em alguns lugares, mas 1.07 é mais seguro para manutenção pura.
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

    // --- CONSULTORIA & SOLUÇÕES ---
    {
      catKey: "DEV",
      name: "MVP para Startups (Escopo Fechado)",
      basePrice: 7500.0,
      description: `Desenvolvimento do núcleo do seu projeto para validação de mercado.\n- Foco estrito nas funcionalidades principais.\n- Tecnologia escalável (Next.js) que permite crescimento futuro.\n- Entrega ágil em sprints quinzenais.`,
    },
    {
      catKey: "DEV", // Integração é desenvolvimento
      name: "Integração de APIs (Automação)",
      basePrice: 1500.0,
      description: `Conecte seus sistemas. Ex: Enviar leads do site para o CRM, emitir nota automática, conectar com meios de pagamento.\n- Valor base por integração simples.`,
    },

    // --- RECORRÊNCIA ---
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

  console.log("🛠️ Sincronizando Serviços...");

  for (const service of services) {
    const categoryId = categoryMap[service.catKey];

    // Remove a chave auxiliar antes de salvar
    const { catKey, ...serviceData } = service;

    const existing = await prisma.serviceType.findFirst({
      where: {
        organizationId: organization.id,
        name: serviceData.name,
      },
    });

    if (!existing) {
      await prisma.serviceType.create({
        data: {
          organizationId: organization.id,
          categoryId: categoryId, // VINCULAÇÃO AQUI
          ...serviceData,
        },
      });
      console.log(`   ✅ Criado: ${serviceData.name}`);
    } else {
      // Opcional: Atualizar a categoria de serviços existentes se estiverem null
      if (!existing.categoryId && categoryId) {
        await prisma.serviceType.update({
          where: { id: existing.id },
          data: { categoryId: categoryId },
        });
        console.log(`   🔄 Atualizado Categoria: ${serviceData.name}`);
      } else {
        console.log(`   ⏭️ Já existe: ${serviceData.name}`);
      }
    }
  }

  console.log("🛠️ Sincronizando Clientes...");

  const clients: Prisma.ClientUncheckedCreateInput[] = [
    {
      organizationId: organization.id,
      companyName: "Shake Show Doces Alimentos LTDA",
      tradeName: "Gelateria Filo Di Latte",
      cnpj: "39.311.323/0003-01",
      email: "contato@filodilatte.com.br",
      phone: "(61) 99805-0981",
      address: "R. Alecrim, 15 - Loja 02 Águas Claras, Brasília - DF",
    },
    {
      organizationId: organization.id,
      companyName: "Clínica de Psicologia Infantil LTDA",
      tradeName: "Acolhe Kids",
      cnpj: "63.051.717/0001-82",
      email: "clinicaacolhekids@gmail.com",
      phone: "(61) 99174-8160",
      address:
        "St. C Norte Edifício Prime Excelência Médica, Torre A, Sala 409 Taguatinga Norte, Brasília - DF",
    },
  ];

  for (const client of clients) {
    const existing = await prisma.client.findFirst({
      where: { companyName: client.companyName },
    });

    if (!existing) {
      await prisma.client.create({
        data: client,
      });
      console.log(`✅ Usuário criado: ${client.companyName}`);
    } else {
      console.log(`🔄 Usuário já existe: ${client.companyName}`);
    }
  }

  console.log("🏁 Seed ajustado para Zofia Code Labs finalizado!");
}

main()
  .then(async () => {
    console.info("Seed completed successfully");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
