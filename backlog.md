infisical = cofre de senha

> **187** itens · **157** concluídos · **3** parciais · ⏳ **12** pendentes · 🔮 **17** futuros
>
> **Pendências ativas:** [currentBacklog.md](currentBacklog.md) — itens ordenados por complexidade, com links para os arquivos de implementação.

🚀 Fase 1: O Motor de Vendas e Financeiro (Cashflow Automático)
Objetivo: Desbloquear o comercial (sua esposa) e garantir o recebimento sem intervenção manual.

- [x] CRUD de Cadastramento de Clientes

Requisito: Suporte completo a dados PJ (Razão Social, CNPJ, Endereço) para contratos.

- [x] CRUD de Cadastramento de Projetos (Rascunho & Metadados)

Requisito: Salvar valor, prazo estimado e escopo macro.

- [x] CRUD de Documentos

Requisito: Adicionar, remover e listar documentos do projeto

- [x] Criação do Fluxo de Trabalho (State Machine)

Requisito: Lógica de transição de status (Rascunho -> Análise -> Contrato -> Pagamento -> Planned).

- [x] Criar componentes de formulários
- [x] Alterar todos os campos de formulários para os componentes para os componentes criados

Requisito: Alterar todos os campos de formulários de todos os formulários para os componentes criados

- [x] Integração do React.email (Notificações)
- [-] Email: Verificação de Conta (Magic Link/Código)
- [x] Email: Alerta de Novo Acesso (Dispositivo desconhecido)
- [x] Email: Bem vindo! Cliente cadastrado;
- [x] Email: Convite para Colaboração
- [x] Email: Bem vindo! Usuário cadastrado (confirmação para o admin);
- [x] Email: Confirmação de Alteração de Senha;
- [x] Email: Esqueceu a senha;
- [x] Email: Proposta disponibilizada para apreciação;
- [x] Email: Contrato disponibilizado para assinatura;
- [x] Email: Pendência de assinatura de contrato;
- [x] Email: Pendência de Pagamento;
- [x] Email: Cobrança de Pagamento;
- [x] Email: Comprovante de Pagamento Recebido;
- [x] Email: Nota Fiscal Emitida (NFS-e);
- [x] Email: Confirmação de aquisição de serviço adicional (analytics, segurança, ia...);
- [x] Email: Informe de início do desenvolvimento;
- [x] Email: Aguardando homologação da solução;
- [x] Email: Report de Impedimento (Blocker)
- [x] Email: Aviso de SLA Próximo do Vencimento
- [x] Email: Status Report Semanal (Resumo)
- [x] Email: Pesquisa de Satisfação (NPS)
- [x] Email: Abertura de Chamado
- [x] Email: Entrega Final do Projeto (Handover)
- [x] Email: Admin: Email de notificação de pagamento;
- [x] Email: Admin: Daily Briefing;

- [x] Implementação dos Emails onde são chamados
  -> [src/email/send/renderEmailTemplate.ts](src/email/send/renderEmailTemplate.ts) — helper central (render `@react-email` + `sendEmail`) para padronizar envio transacional
- [-] Email: Verificação de Conta (Magic Link/Código)
  -> [src/email/send/sendVerificationEmail.ts](src/email/send/sendVerificationEmail.ts) — gerar token em `VerificationToken` e enviar `VerificationEmail` (login por e-mail / confirmação de conta)
- [x] Email: Alerta de Novo Acesso (Dispositivo desconhecido)
  -> [src/auth.ts](src/auth.ts) — callback `signIn` orquestra `RecordLoginHistoryUseCase`
  -> [src/useCases/auth/RecordLoginHistoryUseCase.ts](src/useCases/auth/RecordLoginHistoryUseCase.ts) — persiste `LoginHistory` e dispara `sendNewLoginAlert` para IP/user-agent desconhecidos
- [x] Email: Bem vindo! Cliente cadastrado;
  -> [src/lib/clients/welcomeClientEmail.ts](src/lib/clients/welcomeClientEmail.ts) — primeiro projeto do cliente; e-mail ao responsável (fallback institucional); sem entrada: após assinatura em [triggerDigitalBankIntegration.ts](src/useCases/banking/triggerDigitalBankIntegration.ts); com entrada: após pagamento em [src/app/api/stripe/route.ts](src/app/api/stripe/route.ts) (`InvoiceChargeType.DOWN_PAYMENT`)
- [x] Email: Convite para Colaboração
  -> [src/useCases/organization/InviteOrganizationMemberUseCase.ts](src/useCases/organization/InviteOrganizationMemberUseCase.ts) + [inviteOrganizationMemberAction.ts](src/actions/organization/inviteOrganizationMemberAction.ts) chamados por [InviteMemberForm.tsx](src/app/[locale]/(private)/organization/[organization]/members/_components/InviteMemberForm.tsx)
- [x] Email: Bem vindo! Usuário cadastrado (confirmação para o admin);
  -> [ActivatePendingMembersOnLoginUseCase.ts](src/useCases/auth/ActivatePendingMembersOnLoginUseCase.ts) no callback `signIn` ativa `MemberStatus.PENDING` e notifica admins com `sendUserJoinedNotification`
- [x] Email: Confirmação de Alteração de Senha;
  -> [src/useCases/users/UpdatePasswordUseCase.ts](src/useCases/users/UpdatePasswordUseCase.ts) — após `updatePassword`, enviar `PasswordChangedEmail` ao usuário
  -> [src/useCases/clients/ResetClientEmployeePasswordUseCase.ts](src/useCases/clients/ResetClientEmployeePasswordUseCase.ts) — após reset, enviar `PasswordChangedEmail` (ou e-mail dedicado com senha temporária)
- [x] Email: Esqueceu a senha;
  -> [requestPasswordResetAction.ts](src/actions/auth/requestPasswordResetAction.ts) — action pública que gera token e envia `ForgotPasswordEmail`
  -> [src/useCases/auth/RequestPasswordResetUseCase.ts](src/useCases/auth/RequestPasswordResetUseCase.ts) — use case de solicitação de reset (validação + persistência do token)
- [x] Email: Proposta disponibilizada para apreciação;
  -> [src/useCases/proposal/ChangeProposalStatusUseCase.ts](src/useCases/proposal/ChangeProposalStatusUseCase.ts) — transição para `SENT`, enviar `sendProposalToClient`
- [x] Email: Contrato disponibilizado para assinatura;
  -> [src/useCases/contract/ChangeContractStatusUseCase.ts](src/useCases/contract/ChangeContractStatusUseCase.ts) — transição para `SENT`, `ContractReadyEmail` ao responsável (fallback institucional) via [contractReadyEmail.ts](src/lib/contracts/contractReadyEmail.ts)
  -> [src/app/api/document-sign/webhook/route.ts](src/app/api/document-sign/webhook/route.ts) — complemento no evento `DOCUMENT_SENT`
- [ ] Email: Pendência de assinatura de contrato;
  -> [src/app/api/cron/contract-signature-reminder/route.ts](src/app/api/cron/contract-signature-reminder/route.ts) — job agendado que busca contratos `SENT` vencidos e envia `ContractPendingEmail`
- [x] Email: Pendência de Pagamento;
  -> [src/useCases/financial/CreateInvoiceUseCase.ts](src/useCases/financial/CreateInvoiceUseCase.ts) — ao criar fatura `PENDING`, enviar `PaymentPendingEmail`
  -> [src/useCases/banking/triggerDigitalBankIntegration.ts](src/useCases/banking/triggerDigitalBankIntegration.ts) — após gerar cobrança no gateway (pós-assinatura), via [invoicePaymentEmails.ts](src/lib/invoices/invoicePaymentEmails.ts)
- [ ] Email: Cobrança de Pagamento;
  -> [src/app/api/cron/invoice-overdue/route.ts](src/app/api/cron/invoice-overdue/route.ts) — job agendado para faturas vencidas, enviar `PaymentOverdueEmail`
- [x] Email: Comprovante de Pagamento Recebido;
  -> [src/useCases/financial/UpdateInvoiceStatusUseCase.ts](src/useCases/financial/UpdateInvoiceStatusUseCase.ts) — transição para `PAID`, enviar `PaymentReceivedEmail` ao cliente
  -> [src/app/api/stripe/route.ts](src/app/api/stripe/route.ts) — webhook Stripe, via `maybeSendPaymentReceivedEmail`
- [ ] Email: Nota Fiscal Emitida (NFS-e);
  -> [src/useCases/financial/UpdateInvoiceUseCase.ts](src/useCases/financial/UpdateInvoiceUseCase.ts) — quando `nfseNumber`/`nfseLink` forem preenchidos, enviar `NFSEEmail`
- [x] Email: Informe de início do desenvolvimento;
  -> [src/useCases/projects/ChangeProjectStatusUseCase.ts](src/useCases/projects/ChangeProjectStatusUseCase.ts) — transição para `IN_PROGRESS`, enviar `DevStartEmail` ao cliente
- [x] Email: Aguardando homologação da solução;
  -> [src/useCases/projects/ChangeProjectStatusUseCase.ts](src/useCases/projects/ChangeProjectStatusUseCase.ts) — transição para `REVIEW`, enviar `HomologationReadyEmail` solicitando validação
- [ ] Email: Report de Impedimento (Blocker)
  -> [src/useCases/clients/NotifyClientBlockersUseCase.ts](src/useCases/clients/NotifyClientBlockersUseCase.ts) — novo use case acionado ao registrar/comunicar impedimento (dados de `GetClientBlockersUseCase`), enviar `BlockerReport`
- [ ] Email: Status Report Semanal (Resumo)
  -> [src/app/api/cron/weekly-status-report/route.ts](src/app/api/cron/weekly-status-report/route.ts) — job semanal por projeto ativo, enviar `StatusReportEmail`
- [ ] Email: Pesquisa de Satisfação (NPS)
  -> [src/app/api/cron/project-nps/route.ts](src/app/api/cron/project-nps/route.ts) — após `COMPLETED`/`DELIVERED` (+ janela configurável), enviar `NPSEmail`
- [x] Email: Entrega Final do Projeto (Handover)
  -> [src/useCases/projects/ChangeProjectStatusUseCase.ts](src/useCases/projects/ChangeProjectStatusUseCase.ts) — transição para `DELIVERED` ou `COMPLETED`, enviar `ProjectHandover`
- [ ] Email: Admin: Email de notificação de pagamento;
  -> [src/useCases/financial/UpdateInvoiceStatusUseCase.ts](src/useCases/financial/UpdateInvoiceStatusUseCase.ts) — no `PAID`, notificar admins (`Role.OWNER` / financeiro) com `AdminPaymentNotification`
- [ ] Email: Admin: Daily Briefing;
  -> [src/app/api/cron/admin-daily-briefing/route.ts](src/app/api/cron/admin-daily-briefing/route.ts) — job diário agregando métricas da org, enviar `AdminDailyBriefing` aos admins

- Requisito: Emails transacionais para mudança de status (ex: "Nova proposta gerada", "Projeto aprovado").

- [x] Integração com Documenso (Webhooks e Envio)

Requisito: Envio automático do PDF do contrato e escuta do webhook COMPLETED.

- [x] Ajuste de Config de Integrações — campos com `isSecret`, `required` e `type`/`tag` em [integrationType.ts](src/schemas/integration/integrationType.ts)
- [x] Teste de saúde de integração — validação de credenciais inválidas (ex. Mercado Pago)
- [ ] Integração com Gateway de Pagamento (Mercado Pago)
- [ ] Integração com Gateway de Pagamento (Banco Inter)
- [ ] Integração com Gateway de Pagamento (Stripe)

Requisito: Gerar cobrança dos 30% de entrada após assinatura e liberar o projeto após confirmação via webhook.

- [x] Finalizar Dashboard Principal
- [x] Finalizar Dashboard Financeiro

🏁 MARCO: MVP READY (Uso Interno Viável) 🏁
Neste ponto, o sistema já vende, assina e cobra sozinho. O fluxo comercial está resolvido.
🔨 Fase 2: O Motor de Engenharia (Setup e Gestão)
Objetivo: Automatizar o setup técnico e organizar o escopo de entrega.

- [x] Cadastro de Observações e Backlogs
- [x] Cadastrar backlogs defaults por serviço

Requisito: Quebra do projeto em Épicos/Histórias dentro do sistema.

- [x] Cadastro de Integrações (Gerenciamento de Tokens)

Requisito: Área segura (vault) para salvar Tokens (GitHub PAT, Sonar Token, etc).

- [x] Integração com GitHub - Métricas

Requisito: Criação automática de repositório na Org, times e branches.

- [x] Integração com Infisical (Gestão de Segredos)

Requisito: Provisionamento automático de variáveis de ambiente do projeto.

🛡️ Fase 3: Qualidade e Governança (Diferencial)
Objetivo: Trazer visibilidade de qualidade para o painel do projeto.

- [x] Integração com SonarQube

Requisito: Exibir métricas de qualidade/coverage no dashboard.

📦 Fase 4: Expansão SaaS (Atual - Em Desenvolvimento)
Objetivo: Preparar para multi-tenancy real, permitindo que empresas (Tenants) gerenciem seus próprios acessos e configurações.

🔐 Governança e Permissões (RBAC)

- [x] Arquitetura de Permissões (Strategy Pattern)

Feito: Implementação do AuthBasePermissionStrategy, mapeamento de PERMISSIONS e lógica de checkUserPermissionForAsset.

- [x] Gestão de Perfis de Acesso (Custom Roles)

Feito: CRUD completo de perfis (Repository, UseCase, Action) e UI com Diálogo de seleção granular de permissões.

- [x] Mapeamento de Permissões (Frontend/Backend)

Feito: Criação do PERMISSIONS_MAP unificado para renderizar checkboxes e validar rotas.

### Revisão de aplicação de perfis (Pages & Components)

Escopo: `page.tsx` e componentes colocalizados em `src/app/[locale]/(private)/`. Backend protegido nos use cases. Rotas mapeadas em [routePermissionMap.ts](src/lib/auth/routePermissionMap.ts).

#### Concluídos

**Infraestrutura**

- [x] Mapper de rotas + validação no proxy (`routePermissionMap.ts`, `proxy.ts`, `PermissionDeniedToastComponent`)

**Settings — serviços e despesas**

- [x] `settings/expenses-category/page.tsx` — `canEdit` (`MANAGE_EXPENSE_CATEGORIES`); forms condicionais. (validação global no proxy)
- [x] `settings/services/category/page.tsx` — `canEdit` (`SERVICE_CATALOG.MANAGE`); forms condicionais. (validação global no proxy)
- [x] `settings/services/catalog/page.tsx` — `canEdit` (`SERVICE_CATALOG.MANAGE`); forms condicionais. (validação global no proxy)
- [x] `settings/services/catalog/[serviceId]/page.tsx` — `assertPermission` (`SERVICE_CATALOG.READ`); `canReadBacklog` / `canEditBacklog`. (validação global no proxy)
- [x] `settings/services/catalog/[serviceId]/_components/BacklogFilter.tsx` — prop `canEditBacklog`
- [x] `settings/services/catalog/[serviceId]/_components/BacklogList.tsx` — prop `canEditBacklog`
- [x] `settings/services/catalog/[serviceId]/_components/BacklogDetails.tsx` — prop `canEditBacklog`
- [x] `settings/services/catalog/[serviceId]/_components/BacklogDetailsModal.tsx` — prop `canEditBacklog`
- [x] `settings/services/catalog/[serviceId]/_components/SortableBacklogItem.tsx` — prop `canEditBacklog`

**Settings — integrações**

- [x] `settings/integrations/catalog/page.tsx` — `Role.OWNER`. (validação global no proxy)
- [x] `settings/integrations/config/page.tsx` — (validação global no proxy)

**Menu principal**

- [x] `clients/page.tsx` — rota `CLIENT.READ`. (validação global no proxy)
- [x] `projects/page.tsx` — rota `PROJECT.READ`. (validação global no proxy)
- [x] `financial/page.tsx` — rota `FINANCIAL.VIEW_DASHBOARD`. (validação global no proxy)
- [x] `contracts/page.tsx` — rota `CONTRACT.READ`. (validação global no proxy)

**Clientes e projetos (`/clients/...`)**

- [x] `clients/[client]/page.tsx` — (validação global no proxy)
- [x] `clients/[client]/dashboard/page.tsx` — (validação global no proxy)
- [x] `clients/[client]/analytics/page.tsx` — (validação global no proxy)
- [x] `clients/[client]/metrics/page.tsx` — (validação global no proxy)
- [x] `clients/[client]/ai-reports/page.tsx` — (validação global no proxy)
- [x] `clients/[client]/contracts/page.tsx` — (validação global no proxy)
- [x] `clients/[client]/contracts/signature/[contractId]/page.tsx` — (validação global no proxy)
- [x] `clients/[client]/projects/page.tsx` — (validação global no proxy)
- [x] `clients/[client]/projects/[slug]/form/page.tsx` — (validação global no proxy)
- [x] `clients/[client]/projects/[slug]/[parentTab]/page.tsx` — (validação global no proxy)
- [x] `clients/.../@overview/page.tsx` — (validação global no proxy)
- [x] `clients/.../@dashboard/page.tsx` — (validação global no proxy)
- [x] `clients/.../@backlog/page.tsx` — (validação global no proxy)
- [x] `clients/.../@commercial/page.tsx` e `@commercial/[contextualTab]/page.tsx` — (validação global no proxy)
- [x] `clients/.../@commercial/.../@proposals/page.tsx` — (validação global no proxy)
- [x] `clients/.../@commercial/.../@contracts/page.tsx` — (validação global no proxy)
- [x] `clients/.../@commercial/.../@contracts/signature/[contractId]/page.tsx` — (validação global no proxy)
- [x] `clients/.../@commercial/.../@payments/page.tsx` — (validação global no proxy)
- [x] `clients/.../@commercial/.../@expenses/page.tsx` — (validação global no proxy)
- [x] `clients/.../@metrics/page.tsx` e `@metrics/[contextualTab]/page.tsx` — (validação global no proxy)
- [x] `clients/.../@metrics/.../@codeQuality/page.tsx` — (validação global no proxy)
- [x] `clients/.../@metrics/.../@lifeCycle/page.tsx` — (validação global no proxy)
- [x] `clients/.../@metrics/.../@webAnalytics/page.tsx` — (validação global no proxy)

**Organização (tenant)**

- [x] `organization/[organization]/layout.tsx` — rotas filhas no proxy
- [x] `organization/[organization]/page.tsx` — overview (`PROJECT.READ` ou `MANAGE_MEMBERS`). (validação global no proxy)
- [x] `organization/[organization]/members/page.tsx` — (validação global no proxy)
- [x] `organization/[organization]/roles/page.tsx` — (validação global no proxy)
- [x] `organization/[organization]/billing/page.tsx` — (validação global no proxy)
- [x] `organization/[organization]/settings/page.tsx` — (validação global no proxy)

**Menu principal — UI de escrita**

- [x] `dashboard/page.tsx` — público após login para TENANT_MEMBER e ADMIN (sem regra no proxy)
- [x] `clients/page.tsx` — `CLIENT.CREATE` / `UPDATE` / `DELETE` na UI (`CreateClientForm`, `ClientRemoveOrEdit`)
- [x] `clients/_components/CreateClientForm.tsx` — condicionado à permissão de criação
- [x] `clients/_components/ClientRemoveOrEdit.tsx` — condicionado editar/excluir
- [x] `projects/page.tsx` — sem botão "Novo Projeto" na listagem global
- [x] `financial/page.tsx` — gates em "Nova Transação" / "Exportar"
- [x] `contracts/page.tsx` — `CONTRACT.CREATE` na UI (se houver ações)

**Clientes e projetos — UI de escrita**

- [x] `clients/[client]/page.tsx` — `CLIENT.UPDATE` na UI
- [x] `clients/[client]/projects/page.tsx` — `PROJECT.CREATE`
- [x] `clients/[client]/projects/[slug]/form/page.tsx` — `PROJECT.CREATE` / `UPDATE` conforme modo
- [x] `clients/.../@overview/page.tsx` — gates em observações/atualizações (`READ_OBSERVATIONS`, `READ_RECENT_UPDATES`)
- [x] `clients/.../@overview/_components/ProjectNotesActions.tsx` — alinhado com permissões de projeto
- [x] `clients/[client]/contracts/page.tsx` — `CONTRACT.CREATE` na UI
- [x] `clients/[client]/contracts/signature/[contractId]/page.tsx` — `CONTRACT.SIGN` na UI
- [x] `clients/.../@backlog/page.tsx` — `BACKLOG.READ` / `MANAGE` na UI (`canRead` / `canManage`)
- [x] `clients/.../@backlog/components/*` — receber flags da page
- [x] `clients/.../@commercial/.../@proposals/page.tsx` — gates nos botões de proposta
- [x] `clients/.../@commercial/.../@contracts/page.tsx` — `CreateNewContractButton`
- [x] `clients/.../@commercial/.../@payments/page.tsx` — `CreateInvoceForm`
- [x] `clients/.../@commercial/.../@expenses/page.tsx` — `CreateExpenseForm`
- [x] `user/[userId]/page.tsx` — `MANAGE_MEMBERS` / `Role.OWNER` para perfil alheio; seções sensíveis só no próprio perfil
- [x] `user/[userId]/components/*` — `canEdit` no avatar; segurança, contas e login history condicionados na page
- [x] `organization/.../members/_components/InviteMemberForm.tsx` — `MANAGE_MEMBERS` + `MemberRole` staff
- [x] `organization/.../members/_components/MemberActions.tsx` — menu condicionado a `canManageMembers`
- [x] `organization/.../members/_components/EditMemberRoleDialog.tsx` — via `MemberActions`
- [x] `organization/.../members/_components/GivePermissionToUserForm.tsx` — via `MemberActions`
- [x] `organization/.../members/_components/RemoveMemberAlertDialog.tsx` — via `MemberActions`
- [x] `organization/.../roles/_components/RoleFormDialog.tsx` — `MANAGE_MEMBERS`
- [x] `organization/.../roles/_components/DeleteRoleDialog.tsx` — `MANAGE_MEMBERS`
- [x] `organization/[organization]/billing/page.tsx` — ações com `MANAGE_BILLING`
- [x] `organization/[organization]/settings/page.tsx` — formulário/zona de risco com `MANAGE_MEMBERS`

**Settings — UI de escrita**

- [x] `settings/services/catalog/page.tsx` — ocultar link "Detalhes do Serviço" sem `SERVICE_CATALOG.READ`
- [x] `settings/integrations/catalog/components/CreateIntegrationTypeForm.tsx` — condicionar criação
- [x] `settings/integrations/catalog/components/IntegrationTypeRemoveOrEdit.tsx` — condicionar editar/remover
- [x] `settings/integrations/config/page.tsx` — props em `IntegrationCard` (conectar tokens)

#### Pendências

**Menu principal — UI de escrita**

_(nenhuma pendência)_

**Clientes e projetos — UI de escrita**

- [x] [clients/.../@overview/page.tsx](src/app/[locale]/(private)/clients/[client]/projects/[slug]/[parentTab]/@overview/page.tsx) — gates em documentos (`PROJECT.MANAGE`) e timeline

**Observação:** componentes compartilhados fora de `app/` (ex.: `AdminSidebar`, `ProjectList`) não entram nesta lista; a revisão deles é dependência das pages acima.

---

## Portal do Cliente (TENANT_OBSERVER + ClientEmployees)

Objetivo: usuários do cliente acessam projetos e documentos via portal, sem rotas internas da house.

### Implementado

- [x] Campos de responsável no `Client` (`responsibleName`, `responsibleEmail`, `responsiblePhone`) + migration + CRUD
- [x] UI: formulário, listagem (badge/card) e overview do responsável legal
- [x] Validação pré-Documenso (`assertClientHasResponsible`) + alerta em `ContractSendToClient`
- [x] Provisionamento idempotente no envio do contrato (`ProvisionClientPortalOwnerUseCase`): `Member TENANT_OBSERVER` + `ClientEmployee ADMIN`; convite (`ClientPortalAccessEmail`) **somente no primeiro projeto do cliente em fase de assinatura** — `isClientFirstProjectReachingContractSigning` em [welcomeClientEmail.ts](src/lib/clients/welcomeClientEmail.ts)
- [x] `CreateClientEmployeeUseCase` cria `Member TENANT_OBSERVER` na mesma transação (`ensureTenantObserverMember`)
- [x] Sessão JWT: `clientMemberships` + `clientMembershipSlugs` (`loadClientMemberships`)
- [x] Proxy: redirect OBSERVER-only → `/minhas-empresas`, allowlist de slugs (`clientPortalRouteMap`)
- [x] UI portal: `ClientSidebar`, página `/minhas-empresas`, layout condicional
- [x] Permissões por `ClientEmployeeRole` (`assertClientEmployeePermission`) em documentos, equipe e blockers
- [x] Label `TENANT_OBSERVER` → "Usuário do cliente" em `roleMapper`

### Testes manuais críticos

1. Cliente **sem** responsável → envio `SENT` falha **antes** do Documenso (e botão desabilitado na UI).
2. Cliente **com** responsável → Documenso OK → `Member OBSERVER` + `ClientEmployee ADMIN` + e-mail de convite.
3. Reenvio `SENT` idempotente (não duplica vínculos; reenvia convite se `PENDING`).
4. Login como OBSERVER-only → só `/minhas-empresas` + slugs permitidos em `/clients/[slug]/...`.
5. ADMIN do client convida USER via UI → USER com permissões restritas (sem `MANAGE_TEAM`).

---

🏢 Gestão da Organização (Tenant)

- [x] Dashboard da Organização (Overview)

Feito: Tela de visão geral com estatísticas, dados cadastrais e layout com Abas (OrganizationLayout, OrganizationTabs).

- [x] Listagem de Membros da Equipe

Feito: Tabela de usuários com visualização de cargos, status e "tratamento seguro" de dados (remoção de password hash no repo).

- [x] Interface de Assinatura (Billing UI)

Feito: Tela de visualização do plano, histórico de faturas e barras de progresso de consumo de recursos (Mock/UI Ready).

- [x] CRUD de edição de perfil de acesso membro
- [x] Deleção de membro da organização
- [x] Formulário de associação de perfis específicos
- [x] Refatoramento Repository de Usuários e forma de buscar permissionamento => Acessar tabela User ou Member?

🤝 Onboarding e Convites

- [x] UI de Convite de Membros

Feito: Modal InviteMemberForm visualmente pronto.

---

## 🔮 BACKLOGS FUTUROS

Itens adiados: módulos sem implementação atual, expansão multi-tenant ou funcionalidades de fases posteriores. Detalhamento ativo em [currentBacklog.md](currentBacklog.md). Rotas `/purchase/*` exibem [UnderConstruction](src/components/UnderConstruction.tsx).

### Módulo de compras (`/purchase/*`)

- [ ] [purchase/analytics/page.tsx](src/app/[locale]/(private)/purchase/analytics/page.tsx) — checkout Analytics + permissão de feature + mapper no proxy
- [ ] [purchase/metrics/page.tsx](src/app/[locale]/(private)/purchase/metrics/page.tsx) — checkout DevSecOps / métricas
- [ ] [purchase/ai-reports/page.tsx](src/app/[locale]/(private)/purchase/ai-reports/page.tsx) — checkout ZofIA Reports
- [ ] Email: Confirmação de aquisição de serviço adicional (analytics, segurança, ia...);
  -> [src/useCases/purchase/ConfirmAddonPurchaseUseCase.ts](src/useCases/purchase/ConfirmAddonPurchaseUseCase.ts) — após checkout/liberação em `purchase/*`, enviar `AddonPurchaseEmail`

### Portal do cliente e identidade

- [ ] Gates USER/VIEWER em todas as telas do portal (incremental)
- [ ] Suporte formal a CPF no model `Client`

### Módulos futuros (suporte, SLA, autorização)

- [ ] Email: Aviso de SLA Próximo do Vencimento
  -> [src/app/api/cron/ticket-sla-warning/route.ts](src/app/api/cron/ticket-sla-warning/route.ts) — chamados (módulo futuro)
- [ ] Email: Abertura de Chamado
  -> [src/useCases/support/CreateTicketUseCase.ts](src/useCases/support/CreateTicketUseCase.ts) — módulo de suporte (futuro)
- [ ] Implementação de regras de autorização

### Multi-tenant e organização (SaaS)

- [ ] CRUD de Cadastramento de Organização — onboarding "Minha Empresa S.A", slug e CNPJ
- [-] Formulário de Configuração da Empresa (Settings) — logo, endereço e configurações globais do tenant
- [ ] Sistema de Convites (Backend) — token, e-mail e página pública "Aceitar Convite / Criar Senha"
- [ ] Integração de Billing Real — webhooks Stripe/Asaas, status de assinatura e bloqueio de recursos
- [ ] Multi-tenant completo (usuário em N organizations)

### Integrações — fases posteriores

- [ ] Permitir integrar mais de 1 projeto ao projeto _(GitHub — Fase 2; SonarQube — Fase 3)_
- [ ] Integração com GitHub (Provisionamento) — repositório, times e branches automáticos
- [ ] Integração com DefectDojo — relatórios de vulnerabilidade
