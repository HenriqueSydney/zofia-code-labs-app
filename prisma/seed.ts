import { PERMISSIONS } from "@/constants/permissions";
import { MemberRole, Prisma, Role } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/utils/generateSlug";
import { hash } from "bcryptjs";

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

  const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap((group) =>
    Object.values(group),
  );

  const adminCustomRoleData: Prisma.CustomRoleUncheckedCreateInput = {
    name: "Administrador",
    organizationId: organization.id,
    description: "Administrador da empresa",
    permissions: ALL_PERMISSIONS,
  };

  const adminCustomRole = await prisma.customRole.create({
    data: adminCustomRoleData,
  });

  const developerCustomRoleData: Prisma.CustomRoleUncheckedCreateInput = {
    name: "Desenvolvedor Sênior",
    organizationId: organization.id,
    description: "Desenvolvedor sênior da organização",
    permissions: [
      // Projetos: Tudo menos deletar/arquivar (segurança operacional)
      PERMISSIONS.PROJECT.READ,
      PERMISSIONS.PROJECT.CREATE,
      PERMISSIONS.PROJECT.UPDATE,

      // Backlog: Controle total para gerir as sprints
      PERMISSIONS.BACKLOG.READ,
      PERMISSIONS.BACKLOG.MANAGE,

      // CRM: Precisa ler dados de clientes para os projetos
      PERMISSIONS.CLIENT.READ,

      // Comercial: Pode ver propostas e contratos para entender o escopo técnica,
      // mas não necessariamente criar/enviar/aprovar
      PERMISSIONS.PROPOSAL.READ,
      PERMISSIONS.CONTRACT.READ,

      // Catálogo: Pode ver o que a empresa oferece
      PERMISSIONS.SERVICE_CATALOG.READ,

      // Financeiro: Acesso apenas a despesas (para lançar custos de ferramentas/infra do projeto)
      PERMISSIONS.EXPENSE.READ,
      PERMISSIONS.EXPENSE.CREATE,

      // Configurações: Apenas integrações técnicas (GitHub, Vercel, etc)
      PERMISSIONS.SETTINGS.MANAGE_INTEGRATIONS,
    ],
  };

  const developerCustomRole = await prisma.customRole.create({
    data: developerCustomRoleData,
  });

  const passwordHash = await hash("123456", 6);

  const users: Prisma.UserUncheckedCreateInput[] = [
    {
      organizationId: organization.id,
      name: "Henrique Sydney Ribeiro Lima",
      email: "henriquesydneylima@gmail.com",
      passwordHash,
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
    let existingUser = await prisma.user.findFirst({
      where: { email: user.email },
    });

    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: user,
      });
      console.log(`✅ Usuário criado: ${user.name}`);
    } else {
      console.log(`🔄 Usuário já existe: ${user.name}`);
    }

    let userLinked = await prisma.member.findFirst({
      where: { userId: existingUser.id },
    });

    if (!userLinked) {
      userLinked = await prisma.member.create({
        data: {
          organizationId: organization.id,
          userId: existingUser.id,
          role: "TENANT_ADMIN",
        },
      });
      console.log(`✅ Usuário vinculado à organização: ${user.name}`);
    } else {
      console.log(`🔄 Usuário já vinculado à organização: ${user.name}`);
    }

    let member = await prisma.member.findFirst({
      where: {
        userId: existingUser.id,
        organizationId: organization.id,
      },
    });

    if (!member) {
      // Definição de permissões baseada no e-mail (Regra de Negócio Zofia Labs)
      let memberRole: MemberRole = MemberRole.TENANT_MEMBER;
      let customRoleId: string = developerCustomRole.id;
      let specificPermissions: string[] = [];
      // Cristina como Responsável Legal / Admin
      if (user.email === "mcristinaas.cruz@gmail.com") {
        memberRole = MemberRole.TENANT_ADMIN;
        customRoleId = adminCustomRole.id;
      } else if (user.email === "henriquesydneylima@gmail.com") {
        specificPermissions = [PERMISSIONS.SETTINGS.MANAGE_MEMBERS];
      }

      member = await prisma.member.create({
        data: {
          organizationId: organization.id,
          userId: existingUser.id,
          role: memberRole,
          customRoleId: customRoleId, // Vincula a CustomRole criada anteriormente
          specificPermissions,
        },
      });
      console.log(`   ✅ Membro criado: ${user.name} com role ${memberRole}`);
    } else {
      // Opcional: Atualizar a customRole se o membro já existir para garantir sincronia do seed
      await prisma.member.update({
        where: { id: member.id },
        data: {
          customRoleId:
            user.email === "mcristinaas.cruz@gmail.com"
              ? adminCustomRole.id
              : developerCustomRole.id,
        },
      });
      console.log(`   🔄 Membro atualizado/verificado: ${user.name}`);
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

  // ============================================================
  // 3. CADASTRANDO CLIENTES
  // ============================================================
  console.log("🛠️ Sincronizando Clientes...");

  const clients: Prisma.ClientUncheckedCreateInput[] = [
    {
      organizationId: organization.id,
      slug: generateSlug({ title: "Gelateria Filo Di Latte" }),
      companyName: "Shake Show Doces Alimentos LTDA",
      tradeName: "Gelateria Filo Di Latte",
      cnpj: "39.311.323/0003-01",
      email: "contato@filodilatte.com.br",
      phone: "(61) 99805-0981",
      address: "R. Alecrim, 15 - Loja 02 Águas Claras, Brasília - DF",
    },
    {
      organizationId: organization.id,
      slug: generateSlug({ title: "Acolhe Kids" }),
      companyName: "Clínica de Psicologia Infantil LTDA",
      tradeName: "Acolhe Kids",
      cnpj: "63.051.717/0001-82",
      email: "clinicaacolhekids@gmail.com",
      phone: "(61) 99174-8160",
      address:
        "St. C Norte Edifício Prime Excelência Médica, Torre A, Sala 409 Taguatinga Norte, Brasília - DF",
    },
    {
      organizationId: organization.id,
      slug: generateSlug({ title: "Dr. Berthran Severo" }),
      companyName: "Dr. Berthran Severo",
      tradeName: "Dr. Berthran",
      cnpj: "14160-DF",
      email: "atendimento@drberthran.com",
      phone: "(61) 99999-9999",
      address: "",
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

  // ============================================================
  // 4. LISTA DE CATEGORIAS DE DESPESAS (FINANCIAL)
  // ============================================================

  const expenseCategories = [
    // --- OPERATIONAL (Recorrentes da Operação) ---
    {
      nature: "OPERATIONAL",
      name: "Infraestrutura Cloud & Servidores",
      description:
        "Custos com Oracle Cloud, AWS, Vercel ou instâncias de bancos de dados.",
    },
    {
      nature: "OPERATIONAL",
      name: "Assinaturas de Software (SaaS)",
      description:
        "Ferramentas de produtividade: GitHub, Slack, Notion, e licenças de IDEs.",
    },
    {
      nature: "OPERATIONAL",
      name: "Marketing & Anúncios",
      description:
        "Gastos com Google Ads, LinkedIn Ads e ferramentas de e-mail marketing.",
    },
    {
      nature: "OPERATIONAL",
      name: "Serviços Contábeis e Taxas",
      description:
        "Mensalidade da contabilidade, taxas bancárias e renovação de certificados digitais.",
    },

    // --- DIRECT_PROJECT (Custos Diretos de Projetos) ---
    {
      nature: "DIRECT_PROJECT",
      name: "Subcontratação (Freelancers)",
      description:
        "Pagamentos feitos a terceiros para execução de partes específicas de um projeto.",
    },
    {
      nature: "DIRECT_PROJECT",
      name: "APIs e Serviços de Terceiros (Consumo)",
      description:
        "Custos variáveis de APIs para projetos: OpenAI, Google Maps, Gateways de SMS/WhatsApp.",
    },

    // --- INVESTMENT (Ativos e Crescimento) ---
    {
      nature: "INVESTMENT",
      name: "Hardware e Equipamentos",
      description:
        "Compra de laptops, servidores ARM, periféricos e mobiliário de escritório.",
    },
    {
      nature: "INVESTMENT",
      name: "Educação e Certificações",
      description:
        "Cursos, pós-graduação (CEUB), e exames de certificação (AWS, Azure, GCP).",
    },

    // --- PERSONAL (Sócios e Retiradas) ---
    {
      nature: "PERSONAL",
      name: "Pró-labore e Dividendos",
      description: "Retiradas mensais dos sócios e distribuição de lucros.",
    },
    {
      nature: "PERSONAL",
      name: "Despesas de Representação",
      description: "Almoços de negócios, viagens para eventos e networking.",
    },
  ];

  console.log("💸 Sincronizando Categorias de Despesas...");

  for (const category of expenseCategories) {
    const existing = await prisma.expenseCategory.findFirst({
      where: {
        organizationId: organization.id,
        name: category.name,
      },
    });

    if (!existing) {
      await prisma.expenseCategory.create({
        data: {
          organizationId: organization.id,
          name: category.name,
          description: category.description,
          nature: category.nature as any, // Cast para o Enum do Prisma
        },
      });
      console.log(`   ✅ Criada: ${category.name} [${category.nature}]`);
    } else {
      // Opcional: Atualizar a natureza se for diferente
      if (existing.nature !== category.nature) {
        await prisma.expenseCategory.update({
          where: { id: existing.id },
          data: { nature: category.nature as any },
        });
        console.log(`   🔄 Atualizada Natureza: ${category.name}`);
      } else {
        console.log(`   ⏭️ Já existe: ${category.name}`);
      }
    }
  }

  // ============================================================
  // 5. CATÁLOGO GLOBAL DE INTEGRAÇÕES (OWNER ONLY)
  // ============================================================
  const globalIntegrations: Omit<
    Prisma.IntegrationTypeUncheckedCreateInput,
    "slug"
  >[] = [
    {
      name: "Stripe",
      description:
        "Gateway de pagamentos global para faturamento e assinaturas via Cartão, PIX e Boleto.",
      logo: "/stripe.svg",
      enableByol: false,
      fieldsSchema: [
        {
          key: "STRIPE_SECRET_KEY",
          type: "password",
          label: "API Secret Key",
          isSecret: true,
          required: true,
        },
        {
          key: "STRIPE_WEBHOOK_SECRET",
          type: "password",
          label: "Webhook Signing Secret",
          isSecret: true,
          required: false,
        },
      ],
    },
    {
      name: "Mercado Pago",
      description:
        "Líder em pagamentos na América Latina. Suporta Cartão, PIX e Boleto.",
      logo: "/mercadopago.svg",
      enableByol: false,
      fieldsSchema: [
        {
          key: "MP_ACCESS_TOKEN",
          type: "password",
          label: "Access Token",
          isSecret: true,
          required: true,
        },
        {
          key: "MP_PUBLIC_KEY",
          type: "text",
          label: "Public Key (Front-end)",
          isSecret: false,
          required: true,
        },
      ],
    },
    {
      name: "Cora Payment",
      description:
        "Banco digital focado em empresas. Ideal para emissão de Boletos e PIX com taxas reduzidas.",
      logo: "/logo-cora.svg",
      enableByol: false,
      externalDocsUrl:
        "https://developers.cora.com.br/docs/instrucoes-iniciais",
      fieldsSchema: [
        {
          key: "CORA_CLIENT_ID",
          type: "text",
          label: "Client ID",
          isSecret: false,
          required: true,
        },
        {
          key: "CORA_CLIENT_SECRET",
          type: "password",
          label: "Client Secret",
          isSecret: true,
          required: true,
        },
      ],
    },
    {
      name: "Umami Analytics",
      description:
        "Análise de web de código aberto, focada em privacidade e simples de usar.",
      logo: "/umami.png",
      enableByol: true,
      externalDocsUrl: "https://umami.is/docs/api",
      fieldsSchema: [
        {
          key: "UMAMI_API_URL",
          type: "text",
          label: "API URL",
          isSecret: false,
          required: true,
          dependsOnByol: true,
        },
        {
          key: "UMAMI_ADMIN_USER",
          type: "text",
          label: "Admin Username",
          isSecret: false,
          required: true,
        },
        {
          key: "UMAMI_ADMIN_PASSWORD",
          type: "password",
          label: "Admin Password",
          isSecret: true,
          required: true,
        },
      ],
    },
    {
      name: "SonarQube",
      description:
        "Monitoramento de qualidade de código, bugs, vulnerabilidades e dívida técnica.",
      logo: "/sonarqube.svg",
      enableByol: true,
      fieldsSchema: [
        {
          key: "SONARQUBE_URL",
          type: "text",
          label: "Sonar Instance URL",
          isSecret: false,
          required: true,
          dependsOnByol: true,
        },
        {
          key: "SONARQUBE_TOKEN",
          type: "password",
          label: "User Analysis Token",
          isSecret: true,
          required: true,
        },
      ],
    },
    {
      name: "DefectDojo",
      description:
        "Orquestração de segurança e agregação de vulnerabilidades (ASOC).",
      logo: "/defectdojo.webp",
      enableByol: true,
      fieldsSchema: [
        {
          key: "DEFECTDOJO_URL",
          type: "text",
          label: "API V2 URL",
          isSecret: false,
          required: true,
          dependsOnByol: true,
        },
        {
          key: "DEFECTDOJO_API_KEY",
          type: "password",
          label: "API Key",
          isSecret: true,
          required: true,
        },
      ],
    },
    {
      name: "GitHub",
      description:
        "Conexão para extração de métricas de produtividade e automação de repositórios.",
      logo: "/github.png",
      enableByol: false,
      externalDocsUrl: "https://docs.github.com/en/rest",
      fieldsSchema: [
        {
          key: "GITHUB_ACCESS_TOKEN",
          type: "password",
          label: "Personal Access Token",
          isSecret: true,
          required: true,
        },
        {
          key: "GITHUB_ORG_NAME",
          type: "text",
          label: "Organization/User Name",
          isSecret: false,
          required: true,
        },
      ],
    },
    {
      name: "Resend",
      description:
        "Plataforma de e-mails para desenvolvedores. Envio transacional com alta taxa de entrega.",
      logo: "/icons/resend.svg",
      enableByol: false,
      fieldsSchema: [
        {
          key: "RESEND_API_KEY",
          type: "password",
          label: "API Key",
          isSecret: true,
          required: true,
        },
        {
          key: "RESEND_FROM_EMAIL",
          type: "text",
          label: "E-mail de Remetente (Ex: no-reply@zofiacodelabs.com)",
          isSecret: false,
          required: true,
        },
      ],
    },
  ];

  console.log("💸 Sincronizando Catálogo de Integrações...");
  for (const it of globalIntegrations) {
    const slug = generateSlug({ title: it.name });
    await prisma.integrationType.upsert({
      where: { slug: slug },
      update: it,
      create: { ...it, slug },
    });
  }

  // ============================================================
  // 7. PROJETOS
  // ============================================================

  const acolheKidsId = await prisma.client.findFirst({
    where: {
      slug: generateSlug({ title: "Acolhe Kids" }),
    },
  });

  const gelateriaId = await prisma.client.findFirst({
    where: {
      slug: generateSlug({ title: "Gelateria Filo Di Latte" }),
    },
  });

  const bertharmId = await prisma.client.findFirst({
    where: {
      slug: generateSlug({ title: "Dr. Berthran Severo" }),
    },
  });

  const ownerEmail = await prisma.user.findUnique({
    where: {
      email: "mcristinaas.cruz@gmail.com",
    },
  });

  const projects: Prisma.ProjectUncheckedCreateInput[] = [
    {
      organizationId: organization.id,
      name: "Acolhe Kids: Plataforma de Conversão e Presença Digital",
      slug: generateSlug({
        title: "Acolhe Kids: Plataforma de Conversão e Presença Digital",
      }),
      description:
        "Desenvolvimento de uma Landing Page de alta performance focada em conversão para a Clínica Acolhe Kids. O projeto priorizou a experiência do usuário (UX) e a velocidade de carregamento, utilizando Next.js com renderização estática para garantir SEO agressivo e baixo tempo de resposta.\n\nA solução incluiu a integração completa com o Google Places para otimização de busca local, além da implementação do Umami Analytics para monitoramento de tráfego focado em privacidade. O design foi concebido para transmitir acolhimento e segurança, alinhado ao público-alvo da clínica.",
      clientId: acolheKidsId?.id ?? "",
      status: "COMPLETED",
      health: "ON_TRACK",
      createdBy: ownerEmail?.id ?? "",
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
      organizationId: organization.id,
      name: "Gelateria Filó Di Latte: Experiência Digital Gastronômica",
      slug: generateSlug({
        title: "Gelateria Filó Di Latte: Experiência Digital Gastronômica",
      }),
      description:
        "Criação de interface digital para a Gelateria Filó Di Latte, focada no apelo visual dos produtos e na facilidade de contato via canais digitais. O projeto utilizou o boilerplate de alta performance da Zofia Labs para garantir uma navegação fluida em dispositivos móveis, onde se concentra 90% do tráfego do cliente.\n\nAlém do frontend moderno com Tailwind CSS, o projeto foi construído para operar na Vercel, com deploy automático via sincronização com o GitHub. A estratégia de SEO local foi aplicada para aumentar a visibilidade da loja física em Brasília.",
      clientId: gelateriaId?.id ?? "",
      status: "COMPLETED",
      health: "ON_TRACK",
      createdBy: ownerEmail?.id ?? "",
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
      organizationId: organization.id,
      name: "Portal Institucional Dr. Berthran: Autoridade e Agendamento",
      slug: generateSlug({
        title: "Portal Institucional Dr. Berthran: Autoridade e Agendamento",
      }),
      description:
        "Desenvolvimento de site institucional robusto para o Dr. Berthran, visando estabelecer autoridade digital e divulgar seu trabalho, em especial os procedimentos realizados por Cirurgia Robótica Minimamente Invasiva. \n\nO foco técnico reside na otimização de Core Web Vitals para garantir que a página figure entre os primeiros resultados de busca orgânica, utilizando estratégias avançadas de cache e minificação de assets.",
      clientId: bertharmId?.id ?? "",
      status: "IN_PROGRESS",
      health: "ON_TRACK",
      createdBy: ownerEmail?.id ?? "",
      estimatedStartDate: date("2026-02-01").toDate(),
      startDate: date("2026-02-01").toDate(),
      endDate: undefined,
      priority: "LOW",
      totalBudget: 0,
      totalSpent: 0,
      remainingBudget: 0,
      tags: ["Nextjs Fullstack", "UI/UX Frontend", "Google Place", "Umami"],
    },
  ];

  for (const projectData of projects) {
    // 1. Criar ou atualizar o projeto
    const project = await prisma.project.upsert({
      where: { slug: projectData.slug },
      update: projectData,
      create: projectData,
    });

    console.log(`🔎 Processando vínculos para: ${project.name}`);

    // 2. Lógica de vinculação automática de serviços baseada no nome/tipo
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
        console.log(`   🔗 Vinculado ao serviço: ${serviceName}`);
      }
    }
  }

  console.log("✅ Seed de projetos finalizado!");

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
