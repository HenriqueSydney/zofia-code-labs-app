# Current Backlog

> ⏳ **6 pendentes** · **5 tarefas abertas** · **1 parcial** · 🔮 **17 futuros**

Itens pendentes extraídos de [backlog.md](backlog.md), ordenados do **menor para o maior** grau de complexidade. Itens semelhantes permanecem agrupados.

> **Legenda:** `- [ ]` pendente · `- [/]` em andamento · `- [-]` parcialmente concluído

> **Rotas:** telas sob `/clients/*`, `/financial`, `/contracts`, `/projects`, `/settings/*` e `/organization/*` já possuem validação global no proxy via [routePermissionMap.ts](src/lib/auth/routePermissionMap.ts). Os itens abaixo referem-se a **gates de UI** (ações de escrita) ou rotas ainda **não mapeadas**.

---

## Nível 1 — Baixa complexidade

Gates de permissão na UI, condicionais em componentes existentes e ajustes pontuais de rota.

_(nenhuma pendência)_

---

## Nível 2 — Baixa a média complexidade

Infraestrutura transacional, e-mails pontuais (hook único) e ajustes de model/dados.

### E-mails — contratos e pagamentos (hooks em use cases existentes)

- [ ] Email: Nota Fiscal Emitida (NFS-e);
      -> [src/useCases/financial/UpdateInvoiceUseCase.ts](src/useCases/financial/UpdateInvoiceUseCase.ts) — quando `nfseNumber`/`nfseLink` forem preenchidos, enviar `NFSEEmail`
- [ ] Email: Admin: Email de notificação de pagamento;
      -> [src/useCases/financial/UpdateInvoiceStatusUseCase.ts](src/useCases/financial/UpdateInvoiceStatusUseCase.ts) — no `PAID`, notificar admins (`Role.OWNER` / financeiro) com `AdminPaymentNotification`

---

## Nível 3 — Média complexidade

Funcionalidades com backend dedicado, jobs agendados e integrações de cobrança.

### Gateways de pagamento (projeto/cliente)

- [ ] Integração com Gateway de Pagamento (Mercado Pago)
- [ ] Integração com Gateway de Pagamento (Banco Inter)
- [ ] Integração com Gateway de Pagamento (Stripe)

Requisito: Gerar cobrança dos 30% de entrada após assinatura e liberar o projeto após confirmação via webhook.

---

## 🔮 BACKLOGS FUTUROS

Itens adiados: módulos sem implementação atual, expansão multi-tenant ou funcionalidades de fases posteriores. Rotas `/purchase/*` exibem [UnderConstruction](src/components/UnderConstruction.tsx).

### E-mails — autenticação e conta

- [-] Email: Verificação de Conta (Magic Link/Código)
  -> [src/email/send/sendVerificationEmail.ts](src/email/send/sendVerificationEmail.ts) — gerar token em `VerificationToken` e enviar `VerificationEmail` (login por e-mail / confirmação de conta)

### E-mails — comunicação operacional

- [ ] Email: Report de Impedimento (Blocker)
      -> [src/useCases/clients/NotifyClientBlockersUseCase.ts](src/useCases/clients/NotifyClientBlockersUseCase.ts) — novo use case acionado ao registrar/comunicar impedimento (dados de `GetClientBlockersUseCase`), enviar `BlockerReport`

### E-mails — jobs agendados (cron)

- [ ] Email: Pendência de assinatura de contrato;
      -> [src/app/api/cron/contract-signature-reminder/route.ts](src/app/api/cron/contract-signature-reminder/route.ts) — job agendado que busca contratos `SENT` vencidos e enviar `ContractPendingEmail`
- [ ] Email: Cobrança de Pagamento;
      -> [src/app/api/cron/invoice-overdue/route.ts](src/app/api/cron/invoice-overdue/route.ts) — job agendado para faturas vencidas, enviar `PaymentOverdueEmail`
- [ ] Email: Status Report Semanal (Resumo)
      -> [src/app/api/cron/weekly-status-report/route.ts](src/app/api/cron/weekly-status-report/route.ts) — job semanal por projeto ativo, enviar `StatusReportEmail`
- [ ] Email: Pesquisa de Satisfação (NPS)
      -> [src/app/api/cron/project-nps/route.ts](src/app/api/cron/project-nps/route.ts) — após `COMPLETED`/`DELIVERED` (+ janela configurável), enviar `NPSEmail`
- [ ] Email: Admin: Daily Briefing;
      -> [src/app/api/cron/admin-daily-briefing/route.ts](src/app/api/cron/admin-daily-briefing/route.ts) — job diário agregando métricas da org, enviar `AdminDailyBriefing` aos admins

### Módulo de compras (`/purchase/*`)

- [ ] [purchase/analytics/page.tsx](<src/app/[locale]/(private)/purchase/analytics/page.tsx>) — checkout Analytics + permissão de feature + mapper no proxy
- [ ] [purchase/metrics/page.tsx](<src/app/[locale]/(private)/purchase/metrics/page.tsx>) — checkout DevSecOps / métricas
- [ ] [purchase/ai-reports/page.tsx](<src/app/[locale]/(private)/purchase/ai-reports/page.tsx>) — checkout ZofIA Reports
- [ ] Email: Confirmação de aquisição de serviço adicional (analytics, segurança, ia...);
      -> [src/useCases/purchase/ConfirmAddonPurchaseUseCase.ts](src/useCases/purchase/ConfirmAddonPurchaseUseCase.ts) — após checkout/liberação em `purchase/*`, enviar `AddonPurchaseEmail`

### Portal do cliente e identidade

- [ ] Gates USER/VIEWER em todas as telas do portal (incremental)
- [ ] Suporte formal a CPF no model `Client`

### Módulos futuros (suporte, SLA, autorização)

- [ ] Email: Aviso de SLA Próximo do Vencimento
      -> [src/app/api/cron/ticket-sla-warning/route.ts](src/app/api/cron/ticket-sla-warning/route.ts) — job agendado sobre chamados (módulo futuro), enviar `SLAWarningEmail` ao responsável
- [ ] Email: Abertura de Chamado
      -> [src/useCases/support/CreateTicketUseCase.ts](src/useCases/support/CreateTicketUseCase.ts) — módulo de suporte (futuro), enviar `TicketCreated` ao cliente
- [ ] Implementação de regras de autorização

### Multi-tenant e organização (SaaS)

- [ ] Sistema de Convites (Backend) — token, e-mail e página pública "Aceitar Convite / Criar Senha"
- [ ] Formulário de Configuração da Empresa (Settings) — logo, endereço e configurações globais do tenant
- [ ] CRUD de Cadastramento de Organização — onboarding "Minha Empresa S.A", slug e CNPJ
- [ ] Integração de Billing Real — webhooks Stripe/Asaas, status de assinatura e bloqueio de recursos
- [ ] Multi-tenant completo (usuário em N organizations)

### Integrações — fases posteriores

- [ ] Permitir integrar mais de 1 projeto ao projeto _(GitHub — Fase 2; SonarQube — Fase 3)_
- [ ] Integração com GitHub (Provisionamento) — repositório, times e branches automáticos
- [ ] Integração com DefectDojo — relatórios de vulnerabilidade
