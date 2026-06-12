import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemberRole } from "../../generated/prisma/enums";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { assertClientAccessForUser } from "../../lib/auth/resolveClientAccess";
import { InMemoryClientsRepository } from "../../repositories/in-memory/InMemoryClientsRepository";
import { GetClientUseCase } from "./GetClientUseCase";

vi.mock("../../lib/auth/resolveClientAccess", () => ({
  assertClientAccessForUser: vi.fn().mockResolvedValue(undefined),
  canObserverAccessClientSlug: vi.fn().mockReturnValue(true),
}));

let clientsRepository: InMemoryClientsRepository;
let sut: GetClientUseCase;

describe("GetClientUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assertClientAccessForUser).mockResolvedValue(undefined);
    clientsRepository = new InMemoryClientsRepository();
    sut = new GetClientUseCase(clientsRepository);
  });

  it("deve retornar cliente existente pelo slug", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    const result = await sut.execute({ slug: "empresa", userId });

    expect(result.client?.slug).toBe("empresa");
    expect(result.client?.companyName).toBe("Empresa LTDA");
  });

  it("não deve retornar cliente inexistente", async () => {
    await expect(() =>
      sut.execute({ slug: "inexistente", userId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve usar assertClientAccessForUser com memberRole do observer", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    await sut.execute({
      slug: "empresa",
      userId,
      memberRole: MemberRole.TENANT_OBSERVER,
    });

    expect(assertClientAccessForUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        memberRole: MemberRole.TENANT_OBSERVER,
        clientSlug: "empresa",
        operation: "READ",
      }),
    );
  });

  it("deve propagar ForbiddenError quando observer não tem acesso", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();

    await clientsRepository.create({
      organizationId,
      companyName: "Empresa LTDA",
      tradeName: "Empresa",
      slug: "empresa",
      cnpj: "12345678000199",
      email: "contato@empresa.com",
      phone: "11999999999",
    });

    vi.mocked(assertClientAccessForUser).mockRejectedValue(
      new ForbiddenError("Você não tem acesso a este cliente."),
    );

    await expect(() =>
      sut.execute({
        slug: "empresa",
        userId,
        memberRole: MemberRole.TENANT_OBSERVER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
