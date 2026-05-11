# Zofia Code Labs App

Aplicação web para gestão comercial e operacional de projetos de software: clientes, propostas, contratos (Documenso), financeiro, backlogs, integrações (GitHub, Infisical, SonarQube, entre outras) e multi-tenant com RBAC. Interface em Next.js com internacionalização (next-intl).

O roteiro de produto, fases e checklists de entrega estão em [backlog.md](./backlog.md).

## Requisitos

- **Node.js** 20 ou superior (alinhado ao `@types/node` do projeto)
- **PostgreSQL** acessível por URL de conexão
- **npm** (há `package-lock.json` na raiz)

## Instalação

```bash
git clone <url-do-repositório>
cd zofia-code-labs-app
npm install
```

Configure as variáveis de ambiente (veja a seção seguinte). O Prisma usa `DATABASE_URL` definido em `prisma.config.ts`.

```bash
# gerar cliente e aplicar migrações em desenvolvimento
npx prisma migrate dev

# (opcional) popular o banco — o comando de seed em prisma.config.ts usa tsx;
# se necessário: npm install -D tsx && npx prisma db seed
npx prisma db seed
```

## Variáveis de ambiente

Ao inicializar a aplicação há a validação das variáveis em `src/env/index.ts`. Portanto, defina pelo menos:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL do PostgreSQL (usada pelo Prisma; ver `prisma.config.ts`) |
| `BASE_URL` | URL base da aplicação (ex.: `http://localhost:3000`) |
| `AUTH_SECRET` | Segredo do NextAuth (ex.: `openssl rand -base64 32`) |
| `JWT_TOKEN_SECRET` | Segredo para assinatura de tokens JWT em fluxos internos |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | Armazenamento de objetos (Cloudflare R2) |
| `DOCUMENSO_API_KEY`, `DOCUMENSO_API_URL` | API Documenso para contratos |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD` | Envio de e-mail (valores padrão existem no schema apenas para desenvolvimento) |
| `GOOGLE_APP_PASSWORD`, `GOOGLE_EMAIL` | Credenciais usadas pelo fluxo de e-mail configurado no projeto |

Outras variáveis usadas em pontos específicos (não necessariamente no schema central):

- `DOCUMENSO_WEBHOOK_KEY` — validação do webhook Documenso (`src/proxy.ts`)
- `NEXT_PUBLIC_APP_URL` — URL pública opcional (ex.: links em logs; padrão `http://localhost:3000`)
- Provedores OAuth do NextAuth (GitHub, GitLab, Google): `AUTH_URL` e chaves conforme documentação do [Auth.js / NextAuth](https://authjs.dev)
- Integrações opcionais: `INFISICAL_*`, `SONARQUBE_URL`, `DEFECTDOJO_URL`, `UMAMI_API_URL`, `LOG_LEVEL`

Segredos de equipe em produção costumam ficar no **Infisical** (referência também no [backlog.md](./backlog.md)).

## Scripts npm

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento Next.js |
| `npm run build` | `prisma generate`, `prisma migrate deploy` e `next build` (adequado a deploy com banco já migrado) |
| `npm run build:dev` | Apenas `next build` (sem migrate no pipeline) |
| `npm run start` | Servidor de produção (`next start`; use após `build`) |
| `npm run lint` | ESLint |
| `npm run email` | Preview dos templates React Email na porta 3333 |

## Stack principal

- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Prisma** 7 com PostgreSQL e múltiplos schemas
- **NextAuth** (Auth.js) com credenciais e OAuth
- **Tailwind CSS** 4, **Radix UI**, formulários com **React Hook Form** e **Zod**
- **React Email** + **Nodemailer**, **TipTap**, **Documenso** (embed), **AWS SDK** (S3 compatível / R2)

## Build de produção

O `next.config.ts` define `output: "standalone"` para imagens Docker ou deploy com pasta `.next/standalone`. O script `build` aplica migrações automaticamente; garanta `DATABASE_URL` no ambiente de CI/CD.

## Licença

Projeto privado (`"private": true` no `package.json`).
