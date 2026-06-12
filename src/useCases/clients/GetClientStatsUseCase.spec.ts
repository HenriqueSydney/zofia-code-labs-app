import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemberRole } from "../../generated/prisma/enums";
import { ForbiddenError } from "../../errors/ForbiddenError";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { assertClientAccessForUser } from "../../lib/auth/resolveClientAccess";
import { InMemoryClientsRepository } from "../../repositories/in-memory/InMemoryClientsRepository";
import { GetClientStatsUseCase } from "./GetClientStatsUseCase";

vi.mock("../../lib/auth/resolveClientAccess", () => ({
  assertClientAccessForUser: vi.fn().mockResolvedValue(undefined),
}));

let clientsRepository: InMemoryClientsRepository;
let sut: GetClientStatsUseCase;

describe("GetClientStatsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assertClientAccessForUser).mockResolvedValue(undefined);
    clientsRepository = new InMemoryClientsRepository();
    sut = new GetClientStatsUseCase(clientsRepository);
  });

  it("deve retornar estatísticas do cliente existente", async () => {
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

    expect(result.clientStats).not.toBeNull();
    expect(result.clientStats?.activeProjects).toBe(0);
  });

  it("não deve retornar estatísticas de cliente inexistente", async () => {
    await expect(() =>
      sut.execute({ slug: "inexistente", userId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
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
