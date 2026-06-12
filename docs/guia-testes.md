# Guia de testes unitários

Padrões Vitest do Zofia Code Labs App. Resumo operacional para o Agent: `.cursor/rules/zofia-testing.mdc`. Setup de runner (`vitest.config.ts`, `npm run test`) é configurado separadamente.

## Escopo

| Tipo | Arquivo | Local |
|------|---------|-------|
| Utils / mappers | `*.spec.ts` | Co-located |
| Erros | `*.spec.ts` | `src/errors/` |
| Use cases | `*.spec.ts` | `src/useCases/<domínio>/` |
| In Memory | `InMemory*Repository.ts` | `src/repositories/in-memory/` |
| Componentes | `*.spec.tsx` | Co-located |
| E2E | `*.e2e-spec.ts` | `e2e/` |

**Não testar com Vitest unitário:** Server Action completa (auth + revalidate), Prisma/PostgreSQL, middleware Next (preferir E2E).

### O que testar (e o que não)

| Camada | Vitest unitário | Playwright E2E |
|--------|-----------------|----------------|
| `src/utils/`, `src/mappers/` | Sim — funções puras/sync | — |
| `src/useCases/*UseCase.ts` | Sim — `sut` + In Memory + mocks de services | — |
| `src/useCases/**/factories/` | Não — wiring trivial (`make*UseCase`) | — |
| `src/repositories/I*.ts` (DTOs/interfaces) | Não — só tipos/contratos | — |
| `src/repositories/prisma/`, `in-memory/` | Não — impl real vs. test double | — |
| `src/actions/` | Não — auth + revalidate; extrair regra para use case | Opcional integração |
| `src/app/**/page.tsx`, layouts, `_data/` | Não — RSC **async** ([Next.js Testing](https://nextjs.org/docs/app/guides/testing)) | Sim |
| `src/app/**/_components/` async RSC | Não | Sim |
| `src/components/` sync apresentacionais | Sim — RTL (ex.: `ErrorMessage`, `StatsCard`) | Complementar |
| `src/components/` `'use client'` / forms | Evitar unitário pesado; preferir E2E | Sim |
| `src/schemas/` (Zod) | Opcional — validação isolada | — |
| `src/services/` (HTTP, S3, etc.) | Mock nos specs de use case | — |

### Cobertura (`npm run test:coverage`)

Configurada em `vitest.config.ts`. **Inclui:** `utils`, `useCases` (exc. factories), `errors`, `mappers`, helpers sync em `app/.../transitions/` e schemas de API.

**Exclui:** `app` (pages, layouts, `_components`, `_data`, routes), `actions`, `repositories`, `services`, `schemas`, `components`, `generated`, factories, `@types`, auth/prisma/proxy.

Métricas refletem apenas código com ROI claro em teste unitário; UI async e integrações ficam fora de propósito.

## Imports nos testes

- **SUT e In Memory:** caminhos relativos (`../../repositories/in-memory/...`).
- **Permitido com `@/`:** erros compartilhados, tipos globais — alinhado a `src/errors/*.spec.ts` e specs que mockam ambiente browser.

## Repositories In Memory

### Regras

- `public items: Entidade[] = []`
- `randomUUID()` em `create`
- Datas: `date()` de `@/lib/dayjs` (export é `date`, não `day`)
- Tipos: `@/generated/prisma/client`
- Implementar **todos** os métodos de `I*Repository`
- `find*`: retorno completo ou `null`
- `update`: merge preservando `id` e `createdAt`; `null` se não achar
- Filtros e soft delete (`deletedAt`, `onlyActives`) espelham `Prisma*Repository`

### Exemplo (trecho — Client)

```typescript
import { randomUUID } from "node:crypto";
import { date } from "../../lib/dayjs";
import { Client } from "../../generated/prisma/client";
import { IClientsRepository, ICreateClientDTO } from "../IClientsRepository";

export class InMemoryClientsRepository implements IClientsRepository {
  public items: Client[] = [];

  async create(data: ICreateClientDTO, document?: { url: string }): Promise<Client> {
    const newClient: Client = {
      id: randomUUID(),
      organizationId: data.organizationId,
      companyName: data.companyName,
      tradeName: data.tradeName,
      slug: data.slug,
      cnpj: data.cnpj,
      email: data.email,
      phone: data.phone,
      address: null,
      logoReference: document?.url ?? null,
      responsibleName: data.responsibleName ?? null,
      responsibleEmail: data.responsibleEmail ?? null,
      responsiblePhone: data.responsiblePhone ?? null,
      createdAt: date().toDate(),
      updatedAt: date().toDate(),
      deletedAt: null,
    };
    this.items.push(newClient);
    return newClient;
  }

  async findByCnpj(cnpj: string): Promise<Client | null> {
    return this.items.find((item) => item.cnpj === cnpj) ?? null;
  }

  // Implementar: update, delete, findById, findBySlug, fetchClients, getClientStats, …
}
```

Ao adicionar campo no Prisma, atualizar **Prisma*Repository** e **InMemory*** no mesmo PR.

## Use cases

### Setup

- `let sut: NomeUseCase`
- `beforeEach`: nova instância de cada `InMemory*Repository`, mocks de services, `sut = new NomeUseCase(deps)`
- Com `vi.mock` global: `vi.clearAllMocks()` no `beforeEach`

### Permissões

| Abordagem | Quando |
|-----------|--------|
| `vi.mock("../../lib/auth/checkUserPermissionForAsset", …)` | Foco em regra de negócio sem RBAC |
| Sem mock + seed de org/membro no In Memory | Testar fluxo que depende de permissão (quando houver helpers/fixtures) |

### Erros esperados (referência)

| Situação típica | Classe |
|-----------------|--------|
| Payload inválido / regra de validação | `ValidationError` |
| ID ou slug inexistente | `ResourceNotFoundError` |
| Sem permissão no asset | `ForbiddenError` ou `UserDoesNotHavePermissionError` |
| Regra de negócio genérica | `AppError` / `BusinessRuleError` |
| Conflito (duplicidade) | `ConflictError` |

### Exemplo completo — CreateClientUseCase

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { ValidationError } from "../../errors/ValidationError";
import { CreateClientUseCase } from "./CreateClientUseCase";
import { InMemoryClientsRepository } from "../../repositories/in-memory/InMemoryClientsRepository";
import type { IS3StorageService } from "../../services/s3Client/IS3StorageService";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let clientsRepository: InMemoryClientsRepository;
let storageService: IS3StorageService;
let sut: CreateClientUseCase;

describe("CreateClientUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clientsRepository = new InMemoryClientsRepository();
    storageService = {
      upload: vi.fn().mockResolvedValue({ key: "logo/key" }),
      getSignedUrl: vi.fn(),
      delete: vi.fn(),
    };
    sut = new CreateClientUseCase(clientsRepository, storageService);
  });

  it("deve criar cliente quando CNPJ não existe", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    const result = await sut.execute(
      {
        companyName: "Empresa LTDA",
        tradeName: "Empresa",
        cnpj: "12345678000199",
        email: "contato@empresa.com",
        phone: "11999999999",
        organizationId,
      },
      userId,
    );

    expect(result.slug).toBe("empresa");
    expect(clientsRepository.items).toHaveLength(1);
  });

  it("não deve criar cliente com CNPJ duplicado", async () => {
    const organizationId = randomUUID();
    const payload = {
      companyName: "A",
      tradeName: "A",
      cnpj: "12345678000199",
      email: "a@a.com",
      phone: "11",
      organizationId,
    };
    await sut.execute(payload, randomUUID());

    await expect(() => sut.execute(payload, randomUUID())).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

});
```

Services externos: mock mínimo da interface (`vi.fn()`).

## Utils (AAA)

Descrições em português: `deve ...`. Sem mocks salvo `window` / `sessionStorage`.

```typescript
import { describe, expect, it } from "vitest";
import { generateSlug } from "./generateSlug";

describe("generateSlug", () => {
  it("deve criar slug padrão com remoção de acentos", () => {
    // Arrange
    const payload = { title: "Título com Ação e Espaços" };

    // Act
    const result = generateSlug(payload);

    // Assert
    expect(result).toBe("titulo-com-acao-e-espacos");
  });

  it("deve respeitar maxLength e remover separador final após corte", () => {
    const payload = { title: "um titulo muito longo", options: { maxLength: 8 } };
    expect(generateSlug(payload)).toBe("um-titul");
  });

  it("deve retornar vazio quando título for inválido", () => {
    expect(generateSlug({ title: "" })).toBe("");
  });
});
```

## Erros de domínio

Referência: `src/errors/AppError.spec.ts` — instância, `message`, `statusCode`, defaults.

## Componentes React

`@testing-library/react`, render síncrono, `getByRole` / `getByText`.

## E2E (Playwright)

`e2e/*.e2e-spec.ts`, POM; evitar `page.waitForTimeout()`.

## Documentação relacionada

- [Arquitetura](./arquitetura.md)
- [Guia de desenvolvimento](./guia-desenvolvimento.md)
