# Permissões e RBAC

O controle de acesso combina **papel de membro** (`MemberRole`), **perfil customizado** (`CustomRole`), **permissões específicas** no `Member` e validação por **tipo de recurso** (Strategy Pattern).

## Fonte de verdade das permissões

Arquivo: `src/constants/permissions.ts`

- Constantes no formato `recurso:ação` (ex.: `project:read`, `contract:sign`)
- `PERMISSIONS_MAP` — metadados para UI (label, ícone, agrupamento)
- Papéis base `MemberRole`: `TENANT_ADMIN`, `TENANT_MEMBER`, `TENANT_OBSERVER`

`Role.OWNER` no `User` ignora checagens granulares em vários fluxos (superusuário da organização).

## Como as permissões chegam na sessão

1. Login via NextAuth (`src/auth.ts`, `lib/auth/auth.config.ts`)
2. Claims carregados em `loadUserProfileClaims` — união de:
   - Permissões do `CustomRole` (se houver)
   - `Member.specificPermissions`
   - Permissões padrão do `MemberRole`
3. JWT inclui `permissions`, `memberRole`, e para portal: `clientMemberships` / `clientMembershipSlugs` (`loadClientMemberships`)

## Validação em duas camadas

### 1. Proxy de rotas (`src/proxy.ts`)

- `resolveRoutePermissionRule(pathname)` → regra em `routePermissionMap.ts`
- `canAccessRoute(subject, rule)` — OWNER passa; demais precisam de permissão ou papel exigido
- Usuário **somente portal** (`TENANT_OBSERVER` sem permissões internas): redirect para `/minhas-empresas` e allowlist em `clientPortalRouteMap.ts`

### 2. Use cases (`checkUserPermissionForAsset`)

```typescript
await checkUserPermissionForAsset("PROJECT", userId, project, "UPDATE");
```

Delega para strategy em `src/lib/auth/strategies/`:

| Strategy | Recursos |
|----------|----------|
| `AuthProjectStrategy` | `Project`, `ProjectMember`, … |
| `AuthClientStrategy` | `Client` |
| `AuthProposalStrategy` | `Proposal` |
| `AuthContractStrategy` | `Contract` |
| `AuthBacklogStrategy` | `BacklogItem` (regras extras em DELETE) |
| `AuthFinancialStrategy` | Despesas, faturas |
| `AuthServiceStrategy` | Catálogo de serviços |
| `AuthDocumentTemplateStrategy` | Templates |
| … | Ver pasta `strategies/` |

Todas estendem `AuthBasePermissionStrategy`: primeiro valida **tenant**, depois RBAC específico.

Erros comuns: `ForbiddenError`, `UserDoesNotHavePermissionError`.

## Portal do cliente (`ClientEmployees`)

Papéis: `ADMIN`, `USER`, `VIEWER` — matriz em `assertClientEmployeePermission.ts`.

| Ação típica | ADMIN | USER | VIEWER |
|-------------|-------|------|--------|
| Ler documentos | ✓ | ✓ | ✓ |
| Gerenciar equipe | ✓ | — | — |

Provisionamento ao enviar contrato (`ProvisionClientPortalOwnerUseCase`):

- Cria `Member` com `TENANT_OBSERVER`
- Cria `ClientEmployees` com `ADMIN` para o responsável legal
- Envia convite por e-mail (`sendClientPortalInvite`)

Pré-condição Documenso: `assertClientHasResponsible` exige os três campos de responsável no `Client`.

## UI vs backend

| Camada | Estado |
|--------|--------|
| Backend (use cases) | Protegido nas operações de escrita/leitura sensíveis |
| Rotas (proxy) | Maioria das páginas privadas mapeadas |
| Componentes (botões, forms) | **Em progresso** — lista em `backlog.md` seção “Revisão de aplicação de perfis” |

Padrão recomendado na UI:

```typescript
const canEdit = subject.permissions.includes(PERMISSIONS.CLIENT.UPDATE);
// ou helper compartilhado quando existir
```

Server Components podem usar `auth()` + checagem de permissão antes de renderizar ações.

## Adicionar uma nova permissão

1. Incluir em `PERMISSIONS` e `PERMISSIONS_MAP`
2. Usar na strategy do recurso (`getRequiredPermission`)
3. Registrar rota em `routePermissionMap.ts` se houver página dedicada
4. Condicionar UI nos componentes afetados
5. Atualizar [requisitos-funcionais.md](./requisitos-funcionais.md) se for requisito de produto

## Referências

- [Arquitetura](./arquitetura.md)
- `backlog.md` — checklist de páginas pendentes de gates na UI
