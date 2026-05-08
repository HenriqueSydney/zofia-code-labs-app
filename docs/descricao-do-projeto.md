# Descrição do projeto

## Visão geral

**Zofia Code Labs App** (`zofia-code-labs-app`) é uma aplicação web orientada a **organizações (tenants)** que funciona como um **mini ERP / painel operacional** para empresas de serviços — em especial *software houses* e perfis similares cadastrados no sistema. Centraliza o relacionamento com clientes, o ciclo de vida de projetos, documentos comerciais (propostas e contratos), finanças vinculadas a projetos e **dashboards** financeiros e de métricas técnicas.

O produto foi concebido para reduzir retrabalho manual entre áreas comercial, financeira e de entrega, integrando-se a serviços externos (assinatura eletrônica, repositórios Git, qualidade de código, analytics e gestão de segredos).

## Domínios principais

Com base no modelo de dados e nas rotas da aplicação, os domínios podem ser agrupados assim:

| Domínio | Descrição resumida |
|---------|-------------------|
| **Identidade e organização** | Usuários, sessões, organizações (`Organization`), membros (`Member`), papéis customizados (`CustomRole`) e permissões granulares |
| **Catálogo** | Categorias e tipos de serviço, templates de documentos (TipTap/JSON), itens de backlog padrão por serviço |
| **CRM** | Clientes (PJ), funcionários do cliente, propostas com versionamento e fluxo de status, contratos e vínculo com assinatura externa |
| **Projetos** | Projetos por cliente, status operacional (máquina de estados), documentos, backlog, membros, notas |
| **Financeiro** | Despesas, categorias, orçamento/receitas conforme modelagem em `financial`, faturas na organização |
| **Integrações** | Tipos de integração, configuração por organização (tokens/credenciais), fábrica de integrações e métricas (GitHub, SonarQube, Umami, Documenso, Infisical, entre outros suportados pelo código) |
| **Auditoria** | Rastreabilidade de ações relevantes (`audit`) |

## Funcionalidades de alto nível (produto)

As capacidades abaixo refletem o escopo desejado do produto e o que está **implementado ou em evolução** no repositório:

- **Cadastro e gestão de projetos** — metadados, vínculo ao cliente, serviços, status e áreas (overview, comercial, backlog, métricas).
- **CRM básico** — carteira de clientes (dados PJ), propostas com itens de catálogo e fluxo de aprovação/rejeição.
- **Contratos e assinatura** — geração/upload de documentos, integração com **Documenso** para fluxo de assinatura e webhooks.
- **Despesas e receitas** — controle financeiro associado ao contexto do projeto e dashboards agregados.
- **Gateway de pagamento** — previsto no roadmap (Mercado Pago, Banco Inter, Stripe); cobrança alinhada a marcos (ex.: entrada após assinatura).
- **Dashboards** — painel principal, financeiro, métricas por cliente/projeto (ciclo de vida, qualidade de código, analytics web).
- **Backlog** — itens priorizados, com possibilidade de origem em templates por tipo de serviço.
- **Integrações** — GitHub (métricas), SonarQube, Umami (analytics), Infisical (segredos), armazenamento S3 (documentos), notificações por e-mail (React Email / fluxos transacionais em evolução).

## Arquitetura técnica (observada)

| Aspecto | Tecnologia |
|---------|------------|
| Framework | Next.js (App Router), React |
| Linguagem | TypeScript |
| Persistência | PostgreSQL via Prisma ORM (múltiplos schemas) |
| Autenticação | NextAuth v5 |
| UI | Radix UI, Tailwind CSS, componentes próprios |
| Internacionalização | `next-intl` (rotas com `[locale]`) |
| Validação | Zod |
| Documentos ricos | TipTap |
| Armazenamento de arquivos | AWS S3 (SDK) |
| Observabilidade | `@vercel/otel` (OpenTelemetry) |

## Público-alvo

- **Interno Zofia Code Labs**: equipe comercial, gestão de projetos e financeiro.
- **Evolutivo (SaaS)**: outras organizações como tenants, com RBAC e configurações por organização — conforme direção indicada no roadmap do repositório.

## Limitações e trabalho em curso

O `README.md` na raiz lista explicitamente itens **concluídos**, **parciais** e **pendentes** (ex.: billing real, convites com backend completo, múltiplos gateways de pagamento, provisionamento Git avançado). Esta documentação de requisitos deve ser revisada quando esses itens forem fechados.
