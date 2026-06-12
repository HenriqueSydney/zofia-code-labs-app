# Guia de desenvolvimento

Instruções para configurar o ambiente, executar o projeto e seguir os padrões do repositório.

## Pré-requisitos

- **Node.js** 20+
- **PostgreSQL** acessível
- **npm** (lockfile na raiz)

## Setup inicial

```bash
git clone <url-do-repositório>
cd zofia-code-labs-app
npm install
```

1. Copie e preencha variáveis de ambiente (ver tabela abaixo e `README.md`).
2. Aplique migrações e seed:

```bash
npx prisma migrate dev
npx prisma db seed   # requer tsx se o seed usar TypeScript direto
```

3. Inicie o app:

```bash
npm run dev
```

Aplicação em `http://localhost:3000` (locale padrão `pt`).

## Variáveis obrigatórias (runtime)

Validadas em `src/env/index.ts` na subida:

| Variável | Uso |
|----------|-----|
| `DATABASE_URL` | Prisma / PostgreSQL |
| `BASE_URL` | URL base da app |
| `AUTH_SECRET` | NextAuth |
| `JWT_TOKEN_SECRET` | Tokens internos |
| `R2_*` | Cloudflare R2 (storage) |
| `DOCUMENSO_API_KEY`, `DOCUMENSO_API_URL` | Contratos |
| `SMTP_*`, `GOOGLE_*` | E-mail (defaults só para dev) |

Outras variáveis usadas pontualmente: `DOCUMENSO_WEBHOOK_KEY`, OAuth (`AUTH_*`), integrações opcionais — ver `README.md`.

## Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Migrate deploy + build produção |
| `npm run build:dev` | Build sem migrate |
| `npm run lint` | ESLint |
| `npm run email` | Preview React Email na porta 3333 |
| `npx vitest` | Testes unitários |

## Adicionar uma funcionalidade (checklist)

1. **Schema** — alterar `prisma/schema.prisma` e criar migration (`npx prisma migrate dev --name descricao`).
2. **Repositório** — interface + `Prisma*Repository` + factory `make*Repository`.
3. **Use case** — lógica + `checkUserPermissionForAsset` quando houver recurso protegido.
4. **Factory** — `make*UseCase.ts` com dependências.
5. **Server Action** — `"use server"`, `auth()`, Zod, retorno `{ success, message }`.
6. **UI** — página ou componente; mensagens em `messages/pt.json` e `messages/en.json`.
7. **Permissões** — constante, strategy, `routePermissionMap` e gate na UI.
8. **Documentação** — atualizar `docs/` ou `backlog.md` se mudar comportamento de produto.

## Convenções de código

| Tópico | Convenção |
|--------|-----------|
| Actions | Sufixo `Action`, pasta `src/actions/<domínio>/` |
| Use cases | Sufixo `UseCase`, pasta `src/useCases/<domínio>/` |
| Erros de domínio | Estender `AppError`; não lançar `Error` genérico em regras de negócio |
| Formulários | Schemas em `src/schemas/`; componentes em `src/components/form/` |
| Rotas i18n | Sempre considerar `[locale]` nos links (`Link` do next-intl quando aplicável) |
| Commits | Mensagens em português ou inglês conforme histórico do time |

## Prisma

- Config: `prisma.config.ts` (URL do banco)
- Client gerado: `src/generated/prisma` — rodar `npx prisma generate` após mudanças no schema
- Não editar arquivos gerados manualmente

## Autenticação local

- Login: `/auth/login`
- NextAuth route: `/api/auth/[...nextauth]`
- Para testar portal: usuário com `MemberRole.TENANT_OBSERVER` e vínculo `ClientEmployees`

## E-mails

Templates em `src/email/`. Envio via `src/lib/mailer/sendEmail.ts` e helper `renderEmailTemplate.ts`.

**Importante:** a maioria dos templates existe, mas a **ligação aos fluxos** (status change, cron, etc.) está listada como pendente em `backlog.md`.

## Testes

Vitest configurado; exemplos em `src/errors/*.spec.ts`. Padrões completos (In Memory, use cases, AAA em utils): **[guia-testes.md](./guia-testes.md)**. Regras para o Agent: `.cursor/rules/zofia-testing.mdc`.

Ao adicionar regras críticas, preferir testes no use case com `InMemory*Repository` ou em utilitários puros.

## Build Docker / standalone

`next.config.ts` com `output: "standalone"`. Após `npm run build`, usar `.next/standalone` conforme documentação Next.js.

## Onde buscar ajuda no código

| Dúvida | Onde olhar |
|--------|------------|
| Permissão de rota | `src/lib/auth/routePermissionMap.ts` |
| Transição de status de projeto | `src/app/.../@overview/transitions/` |
| Métricas de cliente | `src/app/.../dashboard/_data/` |
| Resolver erro na action | `src/errors/resolveActionErrorMessage.ts` |

## Documentação relacionada

- [Arquitetura](./arquitetura.md)
- [Permissões e RBAC](./permissoes-e-rbac.md)
- [Modelo de dados](./modelo-de-dados.md)
