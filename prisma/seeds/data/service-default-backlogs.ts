import type { BacklogPriority } from "@/generated/prisma/client";

export type ServiceDefaultBacklogSeed = {
  title: string;
  description: string;
  points: number;
  priority: BacklogPriority;
  order: number;
};

export const serviceDefaultBacklogs: Record<
  string,
  ServiceDefaultBacklogSeed[]
> = {
  "Landing Page Express (Template Otimizado)": [
    {
      order: 1,
      title: "Kickoff, Briefing e Coleta de Conteúdo",
      description:
        "Alinhamento de objetivo de conversão, público-alvo, tom de voz, referências visuais, textos finais e assets (logo, fotos, favicon).",
      points: 2,
      priority: "URGENT",
    },
    {
      order: 2,
      title: "Criar Projeto Next.js e Atualizar Bibliotecas",
      description:
        "Bootstrap do repositório com boilerplate Zofia Labs, Next.js App Router, TypeScript strict, Tailwind CSS 4, ESLint e atualização das dependências para versões estáveis compatíveis.",
      points: 2,
      priority: "HIGH",
    },
    {
      order: 3,
      title: "Customização do Template e Identidade Visual",
      description:
        "Aplicação de cores, tipografia, logo, favicon e ajuste das seções do template (hero, benefícios, prova social, CTA).",
      points: 3,
      priority: "HIGH",
    },
    {
      order: 4,
      title: "Seção Hero, Benefícios e Prova Social",
      description:
        "Implementação da dobra principal, bullets de valor, depoimentos ou selos de confiança e CTAs acima da dobra.",
      points: 2,
      priority: "HIGH",
    },
    {
      order: 5,
      title: "Galeria de Fotos (Portfolio/Produtos)",
      description:
        "Grid responsivo de imagens com lazy loading, lightbox opcional e compressão WebP/AVIF para performance mobile.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 6,
      title: "Integração com Google Places (Mapa e Endereço)",
      description:
        "Embed do mapa, link para rotas, exibição de endereço formatado e dados do perfil Google Business para SEO local.",
      points: 2,
      priority: "HIGH",
    },
    {
      order: 7,
      title: "Integração com Google Avaliações (Reviews)",
      description:
        "Widget ou seção de avaliações do Google Business Profile com nota média, contagem e depoimentos recentes.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 8,
      title: "Integração com Vídeos do YouTube",
      description:
        "Embed otimizado (facade/lazy) de vídeo institucional ou depoimento, com thumbnail e play sob demanda.",
      points: 1,
      priority: "LOW",
    },
    {
      order: 9,
      title: "Formulário de Leads e Botão WhatsApp",
      description:
        "Formulário de contato com validação Zod, integração Resend/e-mail e botão flutuante WhatsApp com UTM.",
      points: 2,
      priority: "HIGH",
    },
    {
      order: 10,
      title: "SEO On-page, Open Graph e Sitemap",
      description:
        "Meta title/description, OG/Twitter cards, robots.txt, sitemap.xml, schema.org LocalBusiness e canonical.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 11,
      title: "Integração Umami Analytics",
      description:
        "Script de tracking privacy-first, eventos de clique em CTA/WhatsApp/formulário e validação em produção.",
      points: 1,
      priority: "MEDIUM",
    },
    {
      order: 12,
      title: "Performance, Core Web Vitals e Deploy",
      description:
        "Otimização LCP/CLS/INP, deploy Vercel/Cloudflare, DNS, SSL, smoke test e homologação com o cliente.",
      points: 2,
      priority: "HIGH",
    },
  ],
  "Site Institucional PME (Até 5 páginas)": [
    {
      order: 1,
      title: "Discovery, Sitemap e Wireframes",
      description:
        "Workshop de escopo, mapa de páginas (Home, Quem Somos, Serviços, Galeria/Portfólio, Contato) e wireframes mobile-first.",
      points: 3,
      priority: "URGENT",
    },
    {
      order: 2,
      title: "Criar Projeto Next.js e Atualizar Bibliotecas",
      description:
        "Setup do repositório, Next.js App Router, TypeScript, Tailwind, next-intl (se aplicável), CI preview e lockfile atualizado.",
      points: 2,
      priority: "HIGH",
    },
    {
      order: 3,
      title: "Design System e Layout Base",
      description:
        "Header, footer, navegação responsiva, tipografia, paleta de cores e componentes compartilhados (Button, Card, Section).",
      points: 3,
      priority: "HIGH",
    },
    {
      order: 4,
      title: "Página Home",
      description:
        "Hero, destaques de serviços, chamada para ação, blocos de confiança e preview de conteúdo dinâmico.",
      points: 3,
      priority: "HIGH",
    },
    {
      order: 5,
      title: "Página Quem Somos",
      description:
        "História da empresa, equipe, missão/visão/valores e timeline ou foto institucional.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 6,
      title: "Página Serviços",
      description:
        "Listagem de serviços com descrição, ícones, FAQ resumido e CTAs para contato ou agendamento.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 7,
      title: "Galeria de Fotos / Portfólio",
      description:
        "Grid filtrável por categoria, lightbox, lazy loading e gestão de legendas/alt text para SEO.",
      points: 3,
      priority: "MEDIUM",
    },
    {
      order: 8,
      title: "Página Contato",
      description:
        "Formulário validado, horário de funcionamento, telefones, e-mail e links para redes sociais.",
      points: 2,
      priority: "HIGH",
    },
    {
      order: 9,
      title: "Integração com Google Places",
      description:
        "Mapa interativo, endereço estruturado, link Google Maps e dados do perfil para busca local.",
      points: 2,
      priority: "HIGH",
    },
    {
      order: 10,
      title: "Integração com Google Avaliações",
      description:
        "Seção de reviews do Google Business com rating, total de avaliações e carrossel de depoimentos.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 11,
      title: "Integração com Vídeos do YouTube",
      description:
        "Página ou seção com embeds de vídeos institucionais, tutoriais ou depoimentos (lazy load).",
      points: 2,
      priority: "LOW",
    },
    {
      order: 12,
      title: "CMS Simples para Edição de Textos",
      description:
        "Painel admin básico ou integração headless para o cliente editar textos e imagens sem deploy.",
      points: 5,
      priority: "MEDIUM",
    },
    {
      order: 13,
      title: "SEO Local, Schema.org e Analytics",
      description:
        "LocalBusiness schema, sitemap, meta por página, Umami Analytics e Search Console.",
      points: 3,
      priority: "MEDIUM",
    },
    {
      order: 14,
      title: "Deploy, Homologação e Handover",
      description:
        "Pipeline Vercel, domínio, SSL, testes cross-browser, guia rápido de uso e entrega formal.",
      points: 3,
      priority: "HIGH",
    },
  ],
  "E-commerce Simples / Catálogo Digital": [
    {
      order: 1,
      title: "Levantamento de Catálogo, Frete e Checkout",
      description:
        "Definição de SKUs, categorias, variações, política de frete, meios de pagamento e fluxo de checkout.",
      points: 3,
      priority: "URGENT",
    },
    {
      order: 2,
      title: "Criar Projeto Next.js e Atualizar Bibliotecas",
      description:
        "Monorepo/app e-commerce com Next.js, Prisma (se necessário), auth, Tailwind, Zod e dependências atualizadas.",
      points: 3,
      priority: "HIGH",
    },
    {
      order: 3,
      title: "Modelagem de Produtos e Categorias",
      description:
        "Schema de produto, categorias, tags, estoque básico, preço promocional e slug amigável.",
      points: 3,
      priority: "HIGH",
    },
    {
      order: 4,
      title: "CRUD e Listagem de Produtos (Vitrine)",
      description:
        "Páginas de listagem com filtros, ordenação, paginação e card de produto responsivo.",
      points: 5,
      priority: "HIGH",
    },
    {
      order: 5,
      title: "Galeria de Fotos por Produto",
      description:
        "Upload múltiplo, imagem principal, zoom/lightbox, thumbnails e otimização WebP no CDN.",
      points: 3,
      priority: "HIGH",
    },
    {
      order: 6,
      title: "Página de Detalhe do Produto",
      description:
        "Descrição rica, especificações, preço, variações, estoque e botão adicionar ao carrinho.",
      points: 3,
      priority: "HIGH",
    },
    {
      order: 7,
      title: "Carrinho de Compras",
      description:
        "Persistência local/sessão, alteração de quantidade, remoção, subtotal e cupom (se aplicável).",
      points: 3,
      priority: "HIGH",
    },
    {
      order: 8,
      title: "Cálculo de Frete Simples",
      description:
        "Regras por CEP/região/peso ou tabela fixa, prazo estimado e exibição no checkout.",
      points: 3,
      priority: "MEDIUM",
    },
    {
      order: 9,
      title: "Integração Gateway de Pagamento (Mercado Pago/Stripe)",
      description:
        "Checkout, PIX/cartão/boleto conforme gateway, webhooks de confirmação e status de pedido.",
      points: 5,
      priority: "URGENT",
    },
    {
      order: 10,
      title: "Login Social — Google",
      description:
        "OAuth Google via Auth.js, vinculação de conta e persistência de sessão segura.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 11,
      title: "Login Social — Facebook",
      description:
        "OAuth Meta/Facebook, permissões mínimas e merge de carrinho ao autenticar.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 12,
      title: "Login Social — Instagram",
      description:
        "Login via Meta/Instagram Basic Display ou estratégia OAuth equivalente conforme API disponível.",
      points: 2,
      priority: "LOW",
    },
    {
      order: 13,
      title: "Login Social — X (Twitter)",
      description:
        "OAuth X/Twitter v2, callback configurado e tratamento de erro de autenticação.",
      points: 2,
      priority: "LOW",
    },
    {
      order: 14,
      title: "Área do Cliente — Pedidos e Perfil",
      description:
        "Histórico de pedidos, detalhe com status, endereços salvos e edição de perfil básico.",
      points: 4,
      priority: "MEDIUM",
    },
    {
      order: 15,
      title: "Painel Admin — Produtos e Pedidos",
      description:
        "Gestão de catálogo, atualização de status de pedido e exportação CSV básica.",
      points: 5,
      priority: "HIGH",
    },
    {
      order: 16,
      title: "E-mails Transacionais de Pedido",
      description:
        "Confirmação de pedido, pagamento aprovado e notificação admin (Resend).",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 17,
      title: "Integração Umami e SEO de Catálogo",
      description:
        "Eventos de add-to-cart/purchase, meta por produto, sitemap dinâmico e schema Product.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 18,
      title: "Testes E2E Checkout e Go-live",
      description:
        "Sandbox de pagamento, fluxo completo compra, homologação cliente e deploy produção.",
      points: 3,
      priority: "HIGH",
    },
  ],
  "Hora Técnica de Desenvolvimento (Fullstack)": [
    {
      order: 1,
      title: "Análise Técnica e Estimativa",
      description:
        "Leitura do código/repositório, reprodução do problema, critérios de aceite e estimativa de horas.",
      points: 1,
      priority: "URGENT",
    },
    {
      order: 2,
      title: "Branch, Ambiente e Dependências",
      description:
        "Criação de branch feature/fix, .env local, install e atualização pontual de libs se necessário.",
      points: 1,
      priority: "HIGH",
    },
    {
      order: 3,
      title: "Implementação da Funcionalidade/Correção",
      description:
        "Desenvolvimento conforme escopo acordado (frontend, backend, API ou integração).",
      points: 3,
      priority: "HIGH",
    },
    {
      order: 4,
      title: "Testes, Code Review e Regressão",
      description:
        "Testes manuais/automatizados, lint, verificação de fluxos adjacentes e PR documentado.",
      points: 1,
      priority: "MEDIUM",
    },
    {
      order: 5,
      title: "Deploy/Merge e Notas de Release",
      description:
        "Merge aprovado, deploy ou orientação ao cliente, changelog e encerramento da hora técnica.",
      points: 1,
      priority: "MEDIUM",
    },
  ],
  "Setup de Infraestrutura Cloud (Básico)": [
    {
      order: 1,
      title: "Planejamento e Diagrama de Infraestrutura",
      description:
        "Definição de VPS/cloud (Oracle/AWS), domínios, portas, volumes, backup e requisitos da app.",
      points: 2,
      priority: "URGENT",
    },
    {
      order: 2,
      title: "Provisionamento da VM e Hardening Básico",
      description:
        "Criação da instância, usuário deploy, SSH keys, firewall (ufw) e atualização do SO.",
      points: 2,
      priority: "HIGH",
    },
    {
      order: 3,
      title: "Docker, Docker Compose e Nginx",
      description:
        "Instalação Docker, compose da stack (app + db se aplicável) e reverse proxy Nginx.",
      points: 3,
      priority: "HIGH",
    },
    {
      order: 4,
      title: "Certificado SSL (HTTPS) e DNS",
      description:
        "Let's Encrypt/Certbot ou Cloudflare SSL, apontamento A/CNAME e validação HTTPS.",
      points: 2,
      priority: "HIGH",
    },
    {
      order: 5,
      title: "Variáveis de Ambiente e Infisical",
      description:
        "Carga de secrets, .env de produção, integração Infisical (se aplicável) e rotação inicial.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 6,
      title: "Deploy da Aplicação e Smoke Test",
      description:
        "Build, pull, up -d, healthcheck, logs e validação dos endpoints críticos.",
      points: 3,
      priority: "HIGH",
    },
    {
      order: 7,
      title: "Backup Automatizado e Monitoramento Uptime",
      description:
        "Cron de backup DB/volumes, retenção e alerta básico de indisponibilidade.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 8,
      title: "Runbook de Operação e Handover",
      description:
        "Documentação: restart, logs, rollback, contatos e procedimentos de emergência.",
      points: 1,
      priority: "LOW",
    },
  ],
  "Otimização de Performance Web (Speed Up)": [
    {
      order: 1,
      title: "Auditoria Lighthouse e Baseline",
      description:
        "Relatório inicial PageSpeed/Lighthouse (mobile/desktop): LCP, CLS, INP, TBT e payload.",
      points: 2,
      priority: "URGENT",
    },
    {
      order: 2,
      title: "Análise de Bundle Next.js",
      description:
        "@next/bundle-analyzer, identificação de chunks pesados e imports desnecessários.",
      points: 1,
      priority: "HIGH",
    },
    {
      order: 3,
      title: "Otimização de Imagens e Galerias",
      description:
        "next/image, WebP/AVIF, dimensões corretas, lazy loading e placeholders blur.",
      points: 2,
      priority: "HIGH",
    },
    {
      order: 4,
      title: "Cache, CDN Cloudflare e Headers",
      description:
        "Cache-Control, stale-while-revalidate, CDN proxy e purge strategy.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 5,
      title: "Minificação CSS/JS e Fontes",
      description:
        "Tree-shaking, critical CSS, font-display swap e subset de fontes.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 6,
      title: "Lazy Load de Embeds (YouTube/Maps)",
      description:
        "Facade pattern para iframes pesados (YouTube, Google Maps) e carregamento sob interação.",
      points: 1,
      priority: "MEDIUM",
    },
    {
      order: 7,
      title: "Validação Pós-otimização e Relatório",
      description:
        "Nova rodada Lighthouse, comparativo antes/depois e recomendações futuras.",
      points: 1,
      priority: "HIGH",
    },
  ],
  "MVP para Startups (Escopo Fechado)": [
    {
      order: 1,
      title: "Discovery, MoSCoW e Backlog do MVP",
      description:
        "Workshop de product scope, priorização must/should/could, user stories e critérios de aceite.",
      points: 5,
      priority: "URGENT",
    },
    {
      order: 2,
      title: "Criar Projeto Next.js e Atualizar Bibliotecas",
      description:
        "Monorepo/app, Next.js 16, React 19, Prisma, Auth.js, Tailwind, Zod, Vitest e CI preview Vercel.",
      points: 3,
      priority: "HIGH",
    },
    {
      order: 3,
      title: "Arquitetura, Schemas Prisma e Migrations",
      description:
        "Modelagem de dados, multi-schema Postgres, migrations versionadas e seed de desenvolvimento.",
      points: 5,
      priority: "HIGH",
    },
    {
      order: 4,
      title: "Autenticação e RBAC Base",
      description:
        "Login credenciais/OAuth, isolamento tenant, Member/CustomRole e guards server-side.",
      points: 5,
      priority: "HIGH",
    },
    {
      order: 5,
      title: "Sprint 1 — Funcionalidades Core (Must-have)",
      description:
        "Primeira entrega das histórias obrigatórias do MVP conforme backlog fechado.",
      points: 13,
      priority: "HIGH",
    },
    {
      order: 6,
      title: "Sprint 2 — Integrações e Refino UX",
      description:
        "APIs externas essenciais, ajustes de feedback, empty states e tratamento de erros.",
      points: 13,
      priority: "HIGH",
    },
    {
      order: 7,
      title: "Integrações Técnicas (GitHub, Sonar, Umami)",
      description:
        "Pipeline CI/CD, quality gate SonarQube, métricas GitHub e analytics Umami conforme escopo.",
      points: 5,
      priority: "MEDIUM",
    },
    {
      order: 8,
      title: "Testes E2E (Playwright) dos Fluxos Críticos",
      description:
        "Cobertura dos happy paths principais na pipeline antes de homologação.",
      points: 3,
      priority: "MEDIUM",
    },
    {
      order: 9,
      title: "Homologação, Go-live e Handover",
      description:
        "Deploy staging → produção, aceite formal, documentação e guia de operação.",
      points: 5,
      priority: "HIGH",
    },
    {
      order: 10,
      title: "Retrospectiva e Roadmap Pós-MVP",
      description:
        "Lições aprendidas, métricas de entrega e backlog priorizado para fase 2.",
      points: 2,
      priority: "LOW",
    },
  ],
  "Integração de APIs (Automação)": [
    {
      order: 1,
      title: "Mapeamento de APIs e Contrato de Dados",
      description:
        "Documentação OpenAPI/Swagger, autenticação (OAuth/API Key), rate limits e fluxo de dados ponta a ponta.",
      points: 2,
      priority: "URGENT",
    },
    {
      order: 2,
      title: "Ambiente Sandbox e Credenciais",
      description:
        "Contas de teste, variáveis Infisical/.env, mocks e fixtures de payload.",
      points: 1,
      priority: "HIGH",
    },
    {
      order: 3,
      title: "Implementação do Adapter/Conector",
      description:
        "Camada de integração desacoplada, mapeamento DTO, retry exponencial e circuit breaker básico.",
      points: 5,
      priority: "HIGH",
    },
    {
      order: 4,
      title: "Webhooks e Idempotência",
      description:
        "Endpoint receptor, validação de assinatura, deduplicação e persistência de eventos.",
      points: 3,
      priority: "MEDIUM",
    },
    {
      order: 5,
      title: "Testes de Integração (Vitest + Supertest)",
      description:
        "Cenários happy path, timeout, 4xx/5xx, payload inválido e regressão automatizada.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 6,
      title: "Observabilidade e Alertas de Falha",
      description:
        "Logs estruturados, métricas de sucesso/falha e alerta em integração indisponível.",
      points: 1,
      priority: "LOW",
    },
    {
      order: 7,
      title: "Documentação Técnica e Handover",
      description:
        "Diagrama de sequência, variáveis, exemplos curl e runbook de reprocessamento.",
      points: 1,
      priority: "MEDIUM",
    },
  ],
  "Manutenção Mensal Básica": [
    {
      order: 1,
      title: "Onboarding e Inventário do Site",
      description:
        "Levantamento de stack, hospedagem, domínios, integrações ativas e contatos de emergência.",
      points: 1,
      priority: "HIGH",
    },
    {
      order: 2,
      title: "Setup Monitoramento Uptime e Alertas",
      description:
        "Ping HTTP, alerta e-mail/Slack em indisponibilidade e dashboard de uptime mensal.",
      points: 2,
      priority: "HIGH",
    },
    {
      order: 3,
      title: "Rotina de Backup Semanal",
      description:
        "Backup DB/arquivos, retenção 4 semanas e teste trimestral de restore.",
      points: 2,
      priority: "HIGH",
    },
    {
      order: 4,
      title: "Atualização de Dependências (Patch/Minor)",
      description:
        "Revisão mensal npm audit, bump seguro de libs e deploy em janela acordada.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 5,
      title: "Banco de Horas — Ajustes de Conteúdo",
      description:
        "Até 2h/mês: textos, fotos, links, banners e pequenos ajustes visuais.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 6,
      title: "Verificação SSL, DNS e Formulários",
      description:
        "Checagem mensal de certificado, registros DNS, formulários e links quebrados.",
      points: 1,
      priority: "LOW",
    },
    {
      order: 7,
      title: "Relatório Mensal de Saúde do Site",
      description:
        "Uptime, backups, horas consumidas, ações realizadas e recomendações.",
      points: 1,
      priority: "LOW",
    },
  ],
  "Consultoria DevOps / Cloud Support": [
    {
      order: 1,
      title: "Assessment de Maturidade DevOps",
      description:
        "Inventário de infra, CI/CD, custos cloud, SLAs atuais e mapa de riscos.",
      points: 3,
      priority: "URGENT",
    },
    {
      order: 2,
      title: "Monitoramento CPU, RAM, Disco e Rede",
      description:
        "Agentes Prometheus/node exporter ou equivalente, dashboards Grafana e alertas.",
      points: 3,
      priority: "HIGH",
    },
    {
      order: 3,
      title: "Pipeline CI/CD — Build, Test e Deploy",
      description:
        "Revisão ou implementação de pipeline com testes automatizados e deploy staging/prod.",
      points: 5,
      priority: "HIGH",
    },
    {
      order: 4,
      title: "Atualizações de Segurança e Patches",
      description:
        "SO, containers, dependências críticas, CVEs abertos e plano de remediação.",
      points: 3,
      priority: "HIGH",
    },
    {
      order: 5,
      title: "Gestão de Secrets (Infisical/Vault)",
      description:
        "Centralização de credenciais, rotação periódica e política de acesso mínimo.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 6,
      title: "Plano de Resposta a Incidentes",
      description:
        "Runbook P1/P2, SLA de resposta, escalação, post-mortem template e war room.",
      points: 2,
      priority: "MEDIUM",
    },
    {
      order: 7,
      title: "Otimização de Custos Cloud",
      description:
        "Rightsizing de instâncias, reserved/savings plans e eliminação de recursos ociosos.",
      points: 2,
      priority: "LOW",
    },
    {
      order: 8,
      title: "Relatório Mensal DevOps",
      description:
        "Métricas de disponibilidade, incidentes, deploys, custos e ações preventivas.",
      points: 2,
      priority: "LOW",
    },
  ],
};
