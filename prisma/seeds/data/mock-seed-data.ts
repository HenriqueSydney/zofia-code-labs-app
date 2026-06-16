import type {
  BacklogPriority,
  BacklogStatus,
  ProjectStatus,
} from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import type { Dayjs } from "dayjs";

export const MOCK_SEED_YEAR = 2026;

export type MockClientSeed = {
  slug: string;
  companyName: string;
  tradeName: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  responsibleName: string;
  responsibleEmail: string;
  responsiblePhone: string;
};

export const mockClients: MockClientSeed[] = [
  {
    slug: "mock-techstart-inovacoes",
    companyName: "TechStart Inovações LTDA",
    tradeName: "TechStart",
    cnpj: "12.345.678/0001-90",
    email: "contato@techstart.com.br",
    phone: "(61) 99876-5432",
    address: "SCS Quadra 8, Bloco B-50, Sala 120, Brasília - DF",
    responsibleName: "Ana Paula Mendes",
    responsibleEmail: "ana.mendes@techstart.com.br",
    responsiblePhone: "(61) 99876-5432",
  },
  {
    slug: "mock-sabor-e-arte",
    companyName: "Restaurante Sabor & Arte LTDA",
    tradeName: "Sabor & Arte",
    cnpj: "23.456.789/0001-01",
    email: "reservas@saborearte.com.br",
    phone: "(61) 98765-4321",
    address: "Av. das Nações Unidas, 1200, Águas Claras, Brasília - DF",
    responsibleName: "Carlos Eduardo Rocha",
    responsibleEmail: "carlos@saborearte.com.br",
    responsiblePhone: "(61) 98765-4321",
  },
  {
    slug: "mock-clinica-vida-plena",
    companyName: "Clínica Vida Plena SA",
    tradeName: "Vida Plena",
    cnpj: "34.567.890/0001-12",
    email: "atendimento@vidaplena.com.br",
    phone: "(61) 97654-3210",
    address: "SHN Quadra 2, Bloco F, Sala 305, Brasília - DF",
    responsibleName: "Dra. Juliana Ferreira",
    responsibleEmail: "juliana@vidaplena.com.br",
    responsiblePhone: "(61) 97654-3210",
  },
  {
    slug: "mock-academia-fitpro",
    companyName: "Academia FitPro Brasil LTDA",
    tradeName: "FitPro",
    cnpj: "45.678.901/0001-23",
    email: "contato@fitprobrasil.com.br",
    phone: "(61) 96543-2109",
    address: "Condomínio Park Shopping, Loja 42, Taguatinga, Brasília - DF",
    responsibleName: "Ricardo Almeida",
    responsibleEmail: "ricardo@fitprobrasil.com.br",
    responsiblePhone: "(61) 96543-2109",
  },
];

export const mockProjectTemplates = [
  {
    suffix: "Landing Page de Conversão",
    serviceName: "Landing Page Express (Template Otimizado)",
    tags: ["Next.js", "SEO", "Umami"],
    budget: 890,
  },
  {
    suffix: "Site Institucional",
    serviceName: "Site Institucional PME (Até 5 páginas)",
    tags: ["Next.js", "CMS", "Google Places"],
    budget: 2400,
  },
  {
    suffix: "Catálogo Digital",
    serviceName: "E-commerce Simples / Catálogo Digital",
    tags: ["Next.js", "E-commerce", "Mercado Pago"],
    budget: 3500,
  },
  {
    suffix: "MVP SaaS",
    serviceName: "MVP para Startups (Escopo Fechado)",
    tags: ["Next.js", "Prisma", "RBAC"],
    budget: 7500,
  },
  {
    suffix: "Integração de APIs",
    serviceName: "Integração de APIs (Automação)",
    tags: ["Node.js", "API", "Automação"],
    budget: 1500,
  },
] as const;

export const mockProjectStatuses: ProjectStatus[] = [
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
  "DELIVERED",
  "DELIVERED",
  "IN_PROGRESS",
  "IN_PROGRESS",
  "IN_PROGRESS",
  "ON_HOLD",
];

export const backlogTaskTemplates: {
  title: string;
  description: string;
  points: number;
  priority: BacklogPriority;
}[] = [
  {
    title: "Kickoff e alinhamento de escopo",
    description:
      "Reunião inicial com stakeholders, definição de objetivos, cronograma e critérios de aceite.",
    points: 2,
    priority: "URGENT",
  },
  {
    title: "Setup do repositório e CI/CD",
    description:
      "Bootstrap do projeto, pipeline de deploy, lint, testes e proteção de branch main.",
    points: 3,
    priority: "HIGH",
  },
  {
    title: "Modelagem de dados e migrations",
    description:
      "Definição do schema Prisma, migrations iniciais e seeds de desenvolvimento.",
    points: 5,
    priority: "HIGH",
  },
  {
    title: "Autenticação e controle de acesso",
    description:
      "Implementação de login, sessão, RBAC e middleware de proteção de rotas.",
    points: 5,
    priority: "HIGH",
  },
  {
    title: "Layout base e design system",
    description:
      "Header, footer, sidebar, tokens de cor, tipografia e componentes shadcn/ui.",
    points: 3,
    priority: "MEDIUM",
  },
  {
    title: "Página inicial responsiva",
    description:
      "Hero, seções de benefícios, CTA e otimização mobile-first com Tailwind.",
    points: 3,
    priority: "HIGH",
  },
  {
    title: "Formulário de contato com validação",
    description:
      "React Hook Form + Zod, envio via Resend e feedback visual de sucesso/erro.",
    points: 2,
    priority: "MEDIUM",
  },
  {
    title: "Integração Google Places e mapa",
    description:
      "Embed de mapa, endereço formatado e link para rotas no Google Maps.",
    points: 2,
    priority: "MEDIUM",
  },
  {
    title: "SEO on-page e metadados",
    description:
      "Title, description, Open Graph, sitemap.xml, robots.txt e schema.org.",
    points: 2,
    priority: "MEDIUM",
  },
  {
    title: "Integração Umami Analytics",
    description:
      "Script de tracking, eventos de CTA e validação em ambiente de produção.",
    points: 1,
    priority: "LOW",
  },
  {
    title: "Módulo de listagem com filtros",
    description:
      "Tabela paginada, busca, ordenação e filtros por status/categoria.",
    points: 5,
    priority: "HIGH",
  },
  {
    title: "CRUD completo com permissões",
    description:
      "Create, read, update e delete com gates de permissão na UI e use case.",
    points: 8,
    priority: "HIGH",
  },
  {
    title: "Upload de arquivos para R2/S3",
    description:
      "Presigned URLs, validação de tipo/tamanho e preview de imagens.",
    points: 3,
    priority: "MEDIUM",
  },
  {
    title: "Integração gateway de pagamento",
    description:
      "Checkout Stripe/Mercado Pago, webhook de confirmação e status de invoice.",
    points: 8,
    priority: "URGENT",
  },
  {
    title: "Dashboard com métricas",
    description:
      "Cards de KPI, gráficos de evolução e filtros por período.",
    points: 5,
    priority: "MEDIUM",
  },
  {
    title: "Testes unitários dos use cases",
    description:
      "Cobertura de cenários felizes, validação e erros de domínio com Vitest.",
    points: 5,
    priority: "MEDIUM",
  },
  {
    title: "Internacionalização pt/en",
    description:
      "Chaves next-intl, tradução de formulários e mensagens de erro.",
    points: 3,
    priority: "LOW",
  },
  {
    title: "Otimização de performance",
    description:
      "Lazy loading, compressão de imagens, cache e Core Web Vitals.",
    points: 3,
    priority: "MEDIUM",
  },
  {
    title: "Homologação com cliente",
    description:
      "Sessão de validação, checklist de aceite e registro de pendências.",
    points: 2,
    priority: "HIGH",
  },
  {
    title: "Deploy em produção e handover",
    description:
      "Deploy final, DNS, monitoramento, documentação e treinamento.",
    points: 2,
    priority: "URGENT",
  },
];

export const observationTemplates: string[] = [
  "Cliente solicitou ajuste na paleta de cores para tons mais escuros.",
  "Reunião de alinhamento realizada — escopo confirmado sem alterações.",
  "Aguardando envio de fotos profissionais para a galeria do site.",
  "Homologação aprovada com ressalvas menores no rodapé.",
  "Integração com WhatsApp Business configurada e testada.",
  "Cliente pediu prioridade na página de agendamento online.",
  "Deploy em produção concluído — DNS propagado em 24h.",
  "Feedback positivo do responsável legal após entrega parcial.",
  "Pendência: certificado SSL do domínio do cliente expira em 30 dias.",
  "Sprint encerrada com 95% dos pontos entregues.",
  "Bloqueio temporário: aguardando aprovação de copy institucional.",
  "Métricas Umami mostram aumento de 40% no tráfego após go-live.",
];

export function resolveBacklogStatusForProject(
  projectStatus: ProjectStatus,
  itemIndex: number,
  totalItems: number,
): BacklogStatus {
  if (projectStatus === "COMPLETED" || projectStatus === "DELIVERED") {
    return itemIndex < totalItems - 1 ? "DONE" : "DONE";
  }

  if (projectStatus === "ON_HOLD") {
    if (itemIndex < totalItems * 0.4) return "DONE";
    if (itemIndex < totalItems * 0.5) return "WAITING_CLIENT";
    return "TODO";
  }

  const progressRatio = itemIndex / totalItems;

  if (progressRatio < 0.55) return "DONE";
  if (progressRatio < 0.7) return "REVIEW";
  if (progressRatio < 0.85) return "IN_PROGRESS";
  if (progressRatio < 0.92) return "TODO";
  return "TODO";
}

export type MockProjectTimeline = {
  estimatedStart: Date;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function clampToYear(value: Dayjs): Dayjs {
  const yearStart = date(`${MOCK_SEED_YEAR}-01-01`).startOf("day");
  const yearEnd = date(`${MOCK_SEED_YEAR}-12-31`).endOf("day");

  if (value.isBefore(yearStart)) return yearStart;
  if (value.isAfter(yearEnd)) return yearEnd;
  return value;
}

/** Distribui inícios de projeto uniformemente entre janeiro e junho. */
export function getMockProjectTimeline(
  projectIndex: number,
  totalProjects: number,
  status: ProjectStatus,
): MockProjectTimeline {
  const windowStart = date(`${MOCK_SEED_YEAR}-01-01`);
  const windowEnd = date(`${MOCK_SEED_YEAR}-06-30`);

  if (status === "IN_PROGRESS") {
    const startDate = date(`${MOCK_SEED_YEAR}-05-01`).add(
      (projectIndex % 3) * 12,
      "day",
    );
    const estimatedStart = startDate.subtract(5, "day");

    return {
      estimatedStart: estimatedStart.toDate(),
      startDate: startDate.toDate(),
      endDate: null,
      createdAt: estimatedStart.toDate(),
      updatedAt: date(`${MOCK_SEED_YEAR}-06-10`)
        .add(projectIndex % 5, "day")
        .toDate(),
    };
  }

  if (status === "ON_HOLD") {
    const startDate = date(`${MOCK_SEED_YEAR}-06-05`);
    const estimatedStart = startDate.subtract(7, "day");

    return {
      estimatedStart: estimatedStart.toDate(),
      startDate: startDate.toDate(),
      endDate: null,
      createdAt: estimatedStart.toDate(),
      updatedAt: startDate.add(10, "day").toDate(),
    };
  }

  const windowDays = windowEnd.diff(windowStart, "day");
  const offsetDays = Math.floor(
    (projectIndex / Math.max(totalProjects - 1, 1)) * windowDays,
  );
  const estimatedStart = windowStart.add(offsetDays, "day");
  const startDate = estimatedStart.add(3, "day");
  const durationDays = 18 + (projectIndex % 5) * 5;
  let endDate = startDate.add(durationDays, "day");

  if (endDate.isAfter(windowEnd)) {
    endDate = windowEnd.subtract(projectIndex % 7, "day");
  }

  return {
    estimatedStart: estimatedStart.toDate(),
    startDate: startDate.toDate(),
    endDate: endDate.toDate(),
    createdAt: estimatedStart.toDate(),
    updatedAt: endDate.toDate(),
  };
}

/** Distribui backlogs ao longo do ano, respeitando a janela do projeto. */
export function getMockBacklogTimeline(
  projectStart: Date,
  projectEnd: Date | null,
  itemIndex: number,
  totalItems: number,
  backlogStatus: BacklogStatus,
): { createdAt: Date; updatedAt: Date } {
  const yearEnd = date(`${MOCK_SEED_YEAR}-12-31`);
  const start = date(projectStart);
  const end = projectEnd ? date(projectEnd) : yearEnd;
  const spanDays = Math.max(end.diff(start, "day"), 1);
  const step = spanDays / Math.max(totalItems - 1, 1);

  const created = clampToYear(
    start
      .add(Math.round(itemIndex * step), "day")
      .hour(9 + (itemIndex % 7))
      .minute((itemIndex * 13) % 60),
  );

  let updated = created;

  if (backlogStatus === "DONE" || backlogStatus === "REVIEW") {
    updated = clampToYear(created.add(1 + (itemIndex % 4), "day"));
  } else if (backlogStatus === "IN_PROGRESS") {
    updated = clampToYear(created.add(itemIndex % 2, "day"));
  }

  return {
    createdAt: created.toDate(),
    updatedAt: updated.toDate(),
  };
}

export function getMockObservationDate(
  projectStart: Date,
  projectEnd: Date | null,
  noteIndex: number,
  totalNotes: number,
): Date {
  const start = date(projectStart);
  const end = projectEnd
    ? date(projectEnd)
    : date(`${MOCK_SEED_YEAR}-12-31`);
  const spanDays = Math.max(end.diff(start, "day"), 1);
  const step = spanDays / Math.max(totalNotes, 1);

  return clampToYear(start.add(Math.round(noteIndex * step), "day")).toDate();
}
