# Discrepâncias entre perfis/permissões na UX e nos Use Cases

**Data da análise:** 11/06/2026  
**Reavaliação:** 11/06/2026 — escopo de domínio (projeto vs organização)  
**Escopo:** comparação entre gates de UI (`hasPermission`, sidebar, `routePermissionMap`), perfis seed (`prisma/seeds/02-custom-roles.ts`) e enforcement nos use cases (`checkUserPermissionForAsset` + strategies em `src/lib/auth/strategies/`).

---

## Veredito da reavaliação (back vs UX)

### Não são “dois perfis” para a mesma coisa

O catálogo define **camadas distintas**, não duplicatas:

| Camada | Onde aparece | Permissões | Escopo dos dados |
|--------|--------------|------------|------------------|
| **Backlog do projeto** | Aba `@backlog` em `/clients/.../projects/[slug]` | `backlog:read`, `backlog:manage` | `BacklogItem.projectId` (obrigatório no schema) |
| **Despesas do projeto** | Aba `@expenses` (comercial do projeto) | `expense:read`, `expense:create`, `expense:approve` | `Expense.projectId` (obrigatório) |
| **Pagamentos/faturas do projeto** | Aba `@payments` (comercial do projeto) | `invoice:read`, `invoice:create`, `invoice:cancel` | `Invoice.projectId` (obrigatório) |
| **Dashboard financeiro org.** | `/financial` | `financial:view_dashboard`, `financial:create`, `financial:export` | Agregação cross-projeto (stats); **não** substitui `expense:*` / `invoice:*` |
| **Tipos de despesa (master data)** | `/settings/expenses-category` | `settings:manage_expense_categories` | `ExpenseCategory` sem `projectId` |
| **Backlog padrão de serviço** | `/settings/services/catalog/[id]` | `service_backlog:read`, `service_backlog:manage` | Template do catálogo — **outro domínio** que `backlog:*` |
| **Conteúdo operacional do projeto** | Overview: documentos, notas | `project:manage` (i18n), `project:update`, `project:create` | Documentos e notas ligados ao projeto |

As descrições em `messages/pt.json` confirmam: `backlog_*` fala em “tarefas e quadros **do projeto**”; `expense_*` / `invoice_*` falam em custos e cobranças no sistema; `financial_*` fala em “módulo financeiro” / dashboard gerencial.

### Quem está certo nas abas de projeto?

| Aba | Veredito | Motivo |
|-----|----------|--------|
| **Backlog** | **UX errada, backend certo** | Use cases usam `backlog:read` / `backlog:manage`. UX usa `project:read` / `project:manage`. |
| **Despesas** | **UX errada, backend certo** | Use cases usam `expense:read` / `expense:create`. UX usa `project:read` / `project:manage`. |
| **Pagamentos** | **UX errada; backend quase certo** | Leitura/atualização usam `invoice:*` na strategy. UX usa `project:read` / `project:manage`. **Exceção no back:** `CreateInvoiceUseCase` chama `project:UPDATE` em vez de `invoice:CREATE` — bug interno do backend. |
| **Documentos / notas (overview)** | **UX parcialmente certa** | `project:manage` no i18n cobre “documentos, notas e conteúdos operacionais”. Backend exige `project:update` (docs) e `project:create` (notas), não `project:manage`. |

**Conclusão:** para backlog, expense e payment **dentro do projeto**, o desenho de produto e o backend (strategies + i18n) apontam para permissões de domínio (`backlog:*`, `expense:*`, `invoice:*`). A UX aplicou `project:manage`/`project:read` de forma genérica — isso está **incorreto** para essas três abas.

O `backlog.md` marca as pages como concluídas com `BACKLOG.READ` / `MANAGE`, mas o código atual ainda usa `PROJECT.*` — documentação interna desatualizada em relação ao código.

---

## Resumo executivo

| Severidade | Qtd. | Descrição |
|------------|------|-----------|
| **Alta** | 4 | UX das abas de projeto usa `project:*` onde o backend (e o catálogo) exigem permissões de domínio. |
| **Média** | 6 | Permissões existem no catálogo mas não são aplicadas em uma das camadas; bug em `CreateInvoiceUseCase`. |
| **Baixa** | 4 | Navegação/rota sem alinhamento fino; dashboard sem gate de UI. |

`project:manage` **não é** permissão umbrella para backlog/expense/invoice — no i18n ela cobre documentos/notas. Foi reutilizada na UX para abas comerciais por engano.

---

## Mapa de referência (fonte da verdade no backend)

| Recurso | Strategy | Operação READ | Operação CREATE/UPDATE/MANAGE |
|---------|----------|---------------|-------------------------------|
| Projeto | `auth-project-strategy` | `project:read` | `project:create`, `project:update`, `project:delete`, `project:archive` |
| Backlog (projeto) | `auth-backlog-strategy` | `backlog:read` | `backlog:manage` |
| Despesa | `auth-financial-strategy` (EXPENSE) | `expense:read` | `expense:create`, `expense:approve` |
| Fatura/Pagamento | `auth-financial-strategy` (INVOICE) | `invoice:read` | `invoice:create`, `invoice:cancel` |
| Proposta | `auth-proposal-strategy` | `proposal:read` | `proposal:create`, `proposal:send`, `proposal:approve` |
| Contrato | `auth-contract-strategy` | `contract:read` | `contract:create`, `contract:sign` |
| Notas do projeto | `projectNotes` → project strategy | `project:read` | `project:create` |
| Documentos | `documents` → project strategy | `project:read` | `project:update` |
| Catálogo de serviços | `auth-service-strategy` | `service_catalog:read` | `service_catalog:manage` |
| Backlog padrão (serviço) | `auth-service-backlog-strategy` | `service_backlog:read` | `service_backlog:manage` |
| Categorias de despesa | `auth-instance-senttings-strategy` | `settings:manage_expense_categories` | idem |
| Integrações | `auth-instance-senttings-strategy` | `settings:read_integrations` | `settings:manage_integrations` |

---

## Discrepâncias de alta severidade

### 1. UX usa `project:manage` / `project:read` nas abas de domínio (erro de front)

**Uso incorreto de `project:manage` / `project:read` (deveria ser permissão de domínio):**

| Arquivo | Gate atual (UX) | Gate correto (back + catálogo) |
|---------|-----------------|----------------------------------|
| `@backlog/page.tsx` | `project:read`, `project:manage` | `backlog:read`, `backlog:manage` |
| `@expenses/page.tsx` | `project:read`, `project:manage` | `expense:read`, `expense:create` |
| `@payments/page.tsx` | `project:read`, `project:manage` | `invoice:read`, `invoice:create` |

**Uso de `project:manage` coerente com i18n (“documentos, notas…”):**

| Arquivo | Gate UX | Gate backend |
|---------|---------|--------------|
| `@overview/page.tsx` (`canManageDocuments`) | `project:manage` | `project:update` |
| `ProjectNotesContainer.tsx` | `project:manage` | `project:create` |

**Impacto nos perfis seed (com backend real, incluindo bug de create invoice):**

| Perfil | Backlog UI | Backlog API | Despesas UI | Despesas API | Pagamentos UI | Pagamentos API |
|--------|-----------|-------------|-------------|--------------|---------------|----------------|
| **Gerente de Projetos** | ✅ manage | ✅ | ✅ create | ✅ | ✅ create | ⚠️ list exige `invoice:read` (não tem); create passa por `project:update` (tem) |
| **Desenvolvedor Sênior** | 🔒 sem `project:manage` | ✅ `backlog:manage` | 🔒 | ✅ `expense:create` | 🔒 | ❌ sem `invoice:read` |
| **Gestor Financeiro** | ✅ read (`project:read`) | ❌ sem `backlog:read` | 🔒 | ✅ | 🔒 | ✅ `invoice:*` |

**Recomendação (front):** corrigir `@backlog`, `@expenses`, `@payments` para usar as permissões de domínio. Manter `project:manage` só em documentos/notas, ou trocar por `project:update` / `project:create` para alinhar 100% com o back.

**Recomendação (back):** corrigir `CreateInvoiceUseCase` para usar `checkUserPermissionForAsset("invoice", …, "CREATE")` como a strategy define.

---

### 2. Backlog do projeto: leitura

| Camada | Permissão exigida |
|--------|-------------------|
| UX (`@backlog/page.tsx`) | `project:read` |
| Use case (`ListBacklogItemsUseCase`) | `backlog:read` |

**Impacto:** **Gestor Financeiro** tem `project:read` mas não `backlog:read`. A listagem falha no use case **antes** do gate visual da página (a action é chamada na linha 79, o gate só na 104).

**Recomendação:** alinhar UX para `backlog:read` / `backlog:manage` e considerar checagem de permissão antes de chamar a action.

---

### 3. Despesas e pagamentos no projeto: leitura

| Aba | UX (leitura) | Use case (leitura) |
|-----|--------------|-------------------|
| Despesas | `project:read` | `expense:read` |
| Pagamentos | `project:read` | `invoice:read` |

Hoje os perfis seed costumam conceder `project:read` junto com `expense:read` / `invoice:read`, mas um perfil customizado pode divergir: a UI mostraria a aba, mas a listagem falharia.

**Recomendação:** usar `expense:read` e `invoice:read` nos gates de `@expenses/page.tsx` e `@payments/page.tsx`.

---

### 4. Observações e atualizações recentes — permissões só na UX

| Permissão | UX | Use case |
|-----------|-----|----------|
| `project:read_observations` | `@overview/page.tsx` oculta `ProjectNotesContainer` | `FetchProjectNotesUseCase` exige `project:read` |
| `project:read_recent_updates` | `@overview/page.tsx` oculta `ProjectActivityLog` | (sem use case dedicado com gate equivalente encontrado) |

**Impacto:** usuário sem `read_observations` não vê o bloco na UI, mas pode obter notas via API se tiver `project:read`.

**Recomendação:** criar operações/strategy específicas ou validar `read_observations` / `read_recent_updates` nos use cases de notas e activity log.

---

### 5. Página `/financial` — botão “Nova transação” invertido

```tsx
// financial/page.tsx
{!canCreate && (
  <Button>...</Button>  // exibe quando o usuário NÃO tem financial:create
)}
```

Gate de `financial:create` / `financial:export` existe na UI, mas a lógica do botão está invertida. Os use cases de stats financeiros (`GetFinancialOverviewUseCase`, `GetFinancialProjectionsUseCase`, `GetExpensesByCategoryUseCase`, `GetRecentTransactionsUseCase`, `GetPendingSettlementsUseCase`) **não validam** `financial:view_dashboard` — apenas a rota (`routePermissionMap`) bloqueia acesso à página.

---

## Discrepâncias de média severidade

### 6. Permissões definidas no catálogo sem gate na UX

| Permissão | Backend (strategy) | UX |
|-----------|-------------------|-----|
| `proposal:send` | `ChangeProposalStatusUseCase` / operações SEND | Nenhum `hasPermission` encontrado em componentes de proposta |
| `proposal:approve` | Strategy + regra de delete | Nenhum gate na UI |
| `contract:sign` | `auth-contract-strategy` (op. SIGN) | Página `signature/[contractId]/page.tsx` sem `hasPermission` |
| `expense:approve` | `auth-financial-strategy` (op. APPROVE) | Nenhum gate na UI de despesas |
| `invoice:cancel` | `auth-financial-strategy` (op. CANCEL) | Nenhum gate explícito na UI de pagamentos |

Usuários podem ver controles de status/ação na UI independentemente dessas permissões; o bloqueio só ocorre na action (se o use case usar a operação correta).

---

### 7. Stats do dashboard vs permissão financeira

| Use case | Permissão verificada |
|----------|---------------------|
| `GetOrganizationOverviewStatsUseCase` | `project:read` |
| `GetBacklogEvolutionUseCase` | `project:read` |
| `GetProjectsVolumeChartUseCase` | `project:read` |
| `GetRecentProjectsUseCase` | `project:read` |
| `GetFinancialOverviewUseCase` | **nenhuma** |
| `GetFinancialProjectionsUseCase` | **nenhuma** |
| `GetExpensesByCategoryUseCase` | **nenhuma** |
| `GetRecentTransactionsUseCase` | **nenhuma** |
| `GetPendingSettlementsUseCase` | **nenhuma** |
| `GetFinancialMetricsUseCase` (métricas no projeto) | `project:read` (não `financial:view_dashboard`) |

**UX:** `dashboard/page.tsx` não aplica `hasPermission`; qualquer usuário autenticado vê os widgets. Componentes financeiros embutidos na página `/financial` dependem só da rota.

---

### 8. `ListExpenseCategoryUseCase` sem RBAC

A página `settings/expenses-category/page.tsx` gateia edição com `settings:manage_expense_categories` e a rota exige a mesma permissão, mas o use case de listagem **não chama** `checkUserPermissionForAsset`. Qualquer usuário que contorne a rota poderia listar categorias.

---

### 9. Role `OWNER` — bypass inconsistente

| Camada | `Role.OWNER` bypass? |
|--------|---------------------|
| `routePermissionMap` / `canAccessRoute` | Sim — acesso total à rota |
| `organizationAccess` | Sim |
| `hasPermission` (UX) | **Não** — só verifica array `permissions` |
| Strategies / use cases | **Não** — só verifica array `permissions` |

No seed, usuários `OWNER` recebem perfil custom (`admin` ou `seniorDeveloper`), então na prática têm permissões no array. Um `OWNER` sem perfil/custom role adequado passaria nas rotas e falharia nas actions.

---

### 10. Sidebar — itens sem filtro de permissão

| Item | Permissão no sidebar | Permissão na rota |
|------|---------------------|-------------------|
| Dashboard, Clientes, Projetos, Financeiro, Contratos | **Nenhuma** (sempre visível) | Sim (`routePermissionMap`) |
| Tipos de despesa (`expenseTypes`) | **Nenhuma** | `settings:manage_expense_categories` |

Usuário vê links que o middleware pode bloquear — experiência confusa, não falha de segurança se o proxy estiver ativo.

---

### 11. Área Organização — alinhamento bom, com ressalva

Páginas em `organization/[organization]/*` usam `getOrganizationUiAccess` (`canManageMembers`, `canManageBilling`), alinhado a `organizationAccess` e `AuthOrganizationStrategy`. **Ressalva:** overview da organização aceita `project:read` **ou** `settings:manage_members` na rota; o use case `GetOrganizationUseCase` segue a mesma lógica na strategy — **consistente**.

---

## Discrepâncias de baixa severidade / alinhamentos corretos

### Alinhados (UX = backend)

- Clientes: `client:create`, `client:update`, `client:delete` (`clients/page.tsx`, `layout.tsx`)
- Projetos: `project:create`, `project:update` (`form/page.tsx`, `ProjectSummary.tsx`)
- Propostas: `proposal:read`, `proposal:create` (`@proposals/page.tsx`)
- Contratos (aba): `contract:read`, `contract:create` (`@contracts/page.tsx`, `ContractHistoryList.tsx`)
- Catálogo de serviços: `service_catalog:read` / `service_catalog:manage`
- Backlog padrão do serviço: `service_backlog:read` / `service_backlog:manage`
- Integrações (config): `settings:read_integrations` / `settings:manage_integrations`

---

## Matriz rápida — perfis seed vs abas do projeto

Legenda: ✅ alinhado · ⚠️ UI mais permissiva · 🔒 UI mais restritiva · ❌ divergência crítica

| Recurso (aba/ação) | Gerente de Projetos | Desenvolvedor Sênior | Gestor Financeiro |
|--------------------|--------------------|-----------------------|-------------------|
| Ver backlog | ✅ | ✅ | ⚠️ UI ok / API falha (`backlog:read`) |
| Editar backlog | ✅ | 🔒 (tem `backlog:manage`, falta `project:manage` na UI) | 🔒 |
| Ver despesas | ✅ | ✅ | ✅ |
| Criar despesa | ✅ | 🔒 | 🔒 |
| Ver pagamentos | ✅ | ✅ | ✅ |
| Criar pagamento | ⚠️ UI sim; list falha (`invoice:read`); create passa (`project:update`) | 🔒 | 🔒 |
| Upload documentos | ✅ | 🔒 (`project:update` na API) | 🔒 |
| Observações (criar) | ✅ | 🔒 (`project:create` na API) | 🔒 |
| Propostas / Contratos | ✅ | ✅ (leitura) / parcial escrita | leitura ✅ |

---

## Use cases sem `checkUserPermissionForAsset` (amostra relevante)

Úteis para auditoria de “backend mais permissivo que a UX”:

- `ListExpenseCategoryUseCase`
- `GetFinancialOverviewUseCase`
- `GetFinancialProjectionsUseCase`
- `GetExpensesByCategoryUseCase`
- `GetRecentTransactionsUseCase`
- `GetPendingSettlementsUseCase`
- `GetUserAllInfoUseCase`, `UpdateAvatarUseCase`, `UpdatePasswordUseCase` (domínio usuário — esperado)

---

## Recomendações priorizadas

1. **Corrigir UX das abas de projeto** — `@backlog` → `backlog:*`; `@expenses` → `expense:*`; `@payments` → `invoice:*` (não `project:manage`).
2. **Corrigir `CreateInvoiceUseCase`** — trocar `project:UPDATE` por `invoice:CREATE` para alinhar com `AuthFinancialStrategy`.
3. **Restringir `project:manage`** a documentos/notas (conforme i18n) ou substituir por `project:update` / `project:create` na overview.
4. **Implementar `read_observations` / `read_recent_updates` no backend** ou remover do catálogo de perfis se forem apenas cosméticos.
5. **Adicionar gates na UX** para `proposal:send`, `proposal:approve`, `contract:sign`, `expense:approve`, `invoice:cancel`.
6. **Corrigir** lógica invertida em `financial/page.tsx` (`!canCreate`).
7. **Proteger use cases de stats financeiros** com `financial:view_dashboard` (módulo `/financial`, escopo org — distinto de `expense:*`/`invoice:*` no projeto).
8. **Filtrar menu principal e “Tipos de despesa”** no `AdminSidebar` com as mesmas regras de `routePermissionMap`.
9. **Atualizar `backlog.md`** — seção “Revisão de aplicação de perfis” declara `BACKLOG.READ`/`MANAGE` nas pages, mas o código ainda usa `PROJECT.*`.
10. **Documentar política de `Role.OWNER`** — bypass só em rotas ou também em `hasPermission`/strategies.

---

## Arquivos analisados (principais)

- `src/constants/permissions.ts`
- `src/utils/hasPermission.ts`
- `src/lib/auth/routePermissionMap.ts`
- `src/lib/auth/checkUserPermissionForAsset.ts`
- `src/lib/auth/strategies/*.ts`
- `src/components/AdminSidebar.tsx`
- `src/app/[locale]/(private)/clients/**` (gates em páginas de projeto)
- `src/app/[locale]/(private)/financial/page.tsx`
- `src/app/[locale]/(private)/settings/**`
- `prisma/seeds/02-custom-roles.ts`
- `src/useCases/**` (grep `checkUserPermissionForAsset`)
