# Remoção — `settings/templates` (Modelos de Documentos)

> **Status:** implementação concluída no código. Pendências abaixo são **documentação**, **seeds**, **limpeza i18n** e **aplicação da migration** em ambientes.

> **Não confundir com:** [`src/email/templates/`](../src/email/templates/) — templates de e-mail transacional (React Email). **Manter.**

---

## Decisão de arquitetura (aplicada)

| Removido | Mantido |
|---|---|
| Catálogo `DocumentTemplate` (`catalog.document_templates`) | `ProposalTemplate` / `ContractTemplate` como snapshots desacoplados (`content` JSON opcional) |
| Editor TipTap e rota `/settings/templates` | Fluxo comercial via **upload de PDF** → `fileKey` → Documenso |
| `ProposalSource` / `ContractSource` com `SYSTEM_TEMPLATE` | Apenas `MANUAL_UPLOAD` |
| Permissão `document_template:manage` e menu lateral | Actions/use cases de update de snapshot (sem UI; reservados para evolução Documenso) |

---

## Concluído

- UI `settings/templates/` e `components/TipTap/` removidos
- Backend `DocumentTemplate*` (actions, use cases, repos, schemas, strategy RBAC) removido
- Fluxo comercial refatorado: `CreateProposalUseCase` / `CreateContractUseCase` exigem PDF
- Prisma: modelo `DocumentTemplate` e enum `TemplateType` removidos; FK `documentTemplateId` retirada dos snapshots
- Migration criada: [`prisma/migrations/20260610120000_remove_document_templates/migration.sql`](../prisma/migrations/20260610120000_remove_document_templates/migration.sql)
- `npx prisma generate` executado
- RBAC: `permissions.ts`, `routePermissionMap.ts`, `AdminSidebar.tsx`, `checkUserPermissionForAsset.ts`
- CSS TipTap removido de `src/app/global.css`
- Dependências `@tiptap/*` e `tippy.js` removidas de `package.json`
- i18n principal: `settings.templates`, `sidebar.documentTemplates`, `document_template_manage`, modos de template em formulários
- `backlog.md` e `currentBacklog.md` sem pendências de Document Template / TipTap
- Testes dos use cases comerciais atualizados e passando

---

## Pendente

### 1. Banco de dados (obrigatório em cada ambiente)

A migration existe mas ainda não está versionada no repositório (`??` no git). Após commit:

```bash
npx prisma migrate deploy
```

### 2. Documentação

Atualizar menções obsoletas a TipTap / `DocumentTemplate` / catálogo de templates:

| Arquivo | O que corrigir |
|---|---|
| [README.md](../README.md) | Remover **TipTap** da lista de stack (linha ~75) |
| [docs/modelo-de-dados.md](modelo-de-dados.md) | Remover `DocumentTemplate`; descrever snapshots `ProposalTemplate` / `ContractTemplate` como JSON opcional desacoplado |
| [docs/descricao-do-projeto.md](descricao-do-projeto.md) | Remover TipTap e “templates de documento” do schema `catalog`; ajustar tabela de funcionalidades |
| [docs/requisitos-funcionais.md](requisitos-funcionais.md) | RF-CTR-03 — substituir referência a `DocumentTemplate` por upload de PDF |
| [docs/permissoes-e-rbac.md](permissoes-e-rbac.md) | Remover `AuthDocumentTemplateStrategy` e permissão `document_template:manage` |
| [docs/plano-de-implantacao.md](plano-de-implantacao.md) | Remover marco M7 “Templates TipTap/variáveis” |

### 3. Seeds

| Arquivo | O que corrigir |
|---|---|
| [prisma/seeds/data/erp-backlog-data.ts](../prisma/seeds/data/erp-backlog-data.ts) | Item RBAC `settings/templates`; épico “Templates de Documentos — TipTap + Variáveis” |
| [prisma/seeds/09-zofia-erp.ts](../prisma/seeds/09-zofia-erp.ts) | Remover TipTap da descrição de stack no seed ERP |

### 4. i18n — chaves mortas (opcional)

Chaves `originTemplate` ainda presentes, sem uso no código após remoção dos ramos `SYSTEM_TEMPLATE`:

| Arquivo | Chaves |
|---|---|
| [messages/pt.json](../messages/pt.json) | `projects.transitions.proposalSend.document.originTemplate`, `contractSend.originTemplate`, `contractReview.originTemplate` |
| [messages/en.json](../messages/en.json) | Idem |

### 5. Código legado de snapshot (opcional / futuro Documenso)

Stack **sem UI** — pode permanecer para evolução com Documenso ou ser removida numa fase posterior:

- `src/actions/proposal/updateProposalTemplate.ts`
- `src/actions/contract/updateContractTemplate.ts`
- `src/useCases/proposal/UpdateProposalTemplateUseCase.ts` (+ spec, factory)
- `src/useCases/contract/UpdateContractTemplateUseCase.ts` (+ spec, factory)
- `src/schemas/proposal/updateProposalTemplateSchema.ts`
- `src/schemas/contract/updateContractTemplateSchema.ts`
- Repositories `*ProposalTemplate*` / `*ContractTemplate*`

---

## Este arquivo

Após concluir as pendências acima, este documento pode ser **arquivado ou removido** — ele deixa de ter utilidade operacional.
