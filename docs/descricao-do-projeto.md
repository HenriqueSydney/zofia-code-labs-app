# Descrição do projeto

## Visão geral

**Zofia Code Labs App** (`zofia-code-labs-app`) é uma aplicação web **multi-organização (tenant)** que funciona como **painel operacional** para empresas de serviços — com foco inicial em *software houses* (`IndustryType.SOFTWARE_HOUSE`). Centraliza CRM, ciclo de vida de projetos, documentos comerciais (propostas e contratos), finanças, backlog, dashboards e integrações técnicas.

O produto reduz retrabalho entre áreas comercial, financeira e de entrega, conectando-se a serviços externos (assinatura eletrônica, repositórios Git, qualidade de código, analytics, cofre de segredos e armazenamento de objetos).

## Domínios principais

Com base no modelo Prisma e nas rotas em `src/app/[locale]/`:

| Domínio | Schema PG | Descrição |
|---------|-----------|-----------|
| **Identidade e organização** | `identity` | `Organization`, `User`, `Member`, `CustomRole`, sessões NextAuth, histórico de login |
| **Catálogo** | `catalog` | Categorias e tipos de serviço, templates de documento (TipTap/JSON), backlog padrão por serviço |
| **CRM** | `crm` | Clientes PJ, funcionários do cliente (`ClientEmployees`), propostas e contratos versionados |
| **Projetos** | `projects` | Projetos, status, documentos, backlog, sprints, notas, membros, integrações por projeto |
| **Financeiro** | `financial` | Despesas, categorias, orçamento (`BudgetEntry`), faturas (`Invoice`) |
| **Integrações** | `integrations` | Tipos de integração, credenciais por organização, snapshots de métricas (Sonar, Umami) |
| **Auditoria** | `audit` | `AuditLog` para rastreabilidade |

## Módulos de interface

### Área interna (equipe da organização)

| Área | Rotas principais |
|------|------------------|
| Dashboard | `/dashboard` |
| Clientes | `/clients`, `/clients/[client]` (overview, dashboard, contratos, analytics, métricas, IA) |
| Projetos | `/projects`, `/clients/[client]/projects/[slug]/...` (overview, comercial, backlog, métricas) |
| Financeiro | `/financial` |
| Contratos | `/contracts` |
| Configurações | `/settings/*` (serviços, templates, despesas, integrações) |
| Organização | `/organization/[organization]/*` (membros, papéis, billing, settings) |
| Perfil | `/user/[userId]` |

Projetos usam **parallel routes** (`@overview`, `@commercial`, `@backlog`, `@metrics`, etc.) para abas independentes com carregamento segmentado.

### Portal do cliente

Usuários com papel `MemberRole.TENANT_OBSERVER` e permissões de portal (`ClientEmployees`) acessam:

- `/minhas-empresas` — seleção de clientes vinculados
- `/clients/[slug]/...` — subconjunto de rotas permitido (`clientPortalRouteMap.ts`)

Requisito de negócio: **responsável legal** (`responsibleName`, `responsibleEmail`, `responsiblePhone` no `Client`) antes do envio de contrato ao Documenso.

### Compras de add-ons (UI)

Rotas em `/purchase/*` (analytics, métricas, relatórios de IA) para evolução de monetização de funcionalidades extras.

## Funcionalidades implementadas (alto nível)

| Capacidade | Estado |
|------------|--------|
| CRUD de clientes PJ + responsável legal | Implementado |
| Projetos com máquina de estados e transições guiadas | Implementado |
| Propostas e contratos versionados + Documenso | Implementado |
| Templates TipTap + variáveis | Parcial (`backlog.md`) |
| Despesas, categorias, faturas, dashboards financeiros | Implementado |
| Backlog (projeto e defaults por serviço) | Implementado |
| Integrações GitHub, SonarQube, Umami, Infisical | Implementado |
| RBAC (CustomRole, Member, strategies, proxy de rotas) | Implementado (UI granular em progresso) |
| Portal do cliente + convite de colaborador | Implementado (base) |
| E-mails transacionais (templates React Email) | Templates prontos; **orquestração nos fluxos pendente** |
| Gateways de pagamento (MP, Inter, Stripe) | Planejado |
| Billing SaaS real | UI mock; backend planejado |

Detalhamento item a item: `backlog.md` na raiz.

## Arquitetura técnica

| Aspecto | Tecnologia / versão |
|---------|-------------------|
| Framework | **Next.js 16** (App Router), **React 19** |
| Linguagem | TypeScript 5 |
| Persistência | **PostgreSQL** via **Prisma 7** (client gerado em `src/generated/prisma`) |
| Autenticação | **NextAuth v5** (credenciais + OAuth) |
| UI | Radix UI, Tailwind CSS 4, shadcn-style em `src/components/ui` |
| Formulários | React Hook Form + Zod (`src/schemas`) |
| i18n | `next-intl` — locales `pt` (padrão) e `en` |
| Documentos ricos | TipTap |
| Armazenamento | **Cloudflare R2** (SDK S3-compatível) |
| Assinatura | Documenso (`@documenso/embed-react`) |
| E-mail | React Email + Nodemailer |
| Observabilidade | `pino`, `@vercel/otel` |
| Testes | Vitest (ex.: `src/errors/*.spec.ts`) |

Deploy: `output: "standalone"` no `next.config.ts`; script `npm run build` executa `prisma migrate deploy`.

## Público-alvo

- **Interno Zofia Code Labs**: comercial, PM, financeiro e engenharia.
- **Clientes corporativos**: portal com papéis `ADMIN`, `USER`, `VIEWER` em `ClientEmployees`.
- **Evolutivo SaaS**: múltiplas organizações como tenants com RBAC e billing (roadmap).

## Limitações e trabalho em curso

Consulte `backlog.md` para o checklist vivo. Destaques:

- Orquestração de todos os e-mails nos use cases e crons
- Gates de permissão em botões/formulários (leitura de rota já no proxy)
- Gateways de pagamento e webhooks de cobrança
- Múltiplos repositórios Git por projeto; provisionamento automático de repo
- DefectDojo; relatórios de IA com dados reais (várias telas ainda placeholder)
- CRUD de criação de organização e convites com token público
- Multi-organização por usuário (hoje um `User` pertence a uma `Organization`)
