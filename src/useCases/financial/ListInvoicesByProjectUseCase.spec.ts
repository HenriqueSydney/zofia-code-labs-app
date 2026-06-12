import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FinancialStatus } from "../../generated/prisma/enums";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryInvoiceRepository } from "../../repositories/in-memory/InMemoryInvoiceRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { ListInvoicesByProjectUseCase } from "./ListInvoicesByProjectUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let invoiceRepository: InMemoryInvoiceRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: ListInvoicesByProjectUseCase;

describe("ListInvoicesByProjectUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invoiceRepository = new InMemoryInvoiceRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new ListInvoicesByProjectUseCase(
      invoiceRepository,
      projectsRepository,
    );
  });

  it("deve listar faturas do projeto", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
    });

    const project = await projectsRepository.create({
      name: "Projeto Alpha",
      description: "Desc",
      slug: "projeto-alpha",
      clientId,
      createdBy: userId,
      organizationId,
    });

    invoiceRepository.clients.push({
      id: clientId,
      organizationId,
      companyName: "Acme",
      tradeName: "Acme",
      slug: "acme",
      cnpj: "12345678000199",
      email: "contato@acme.com",
      phone: "11999999999",
      logoUrl: null,
      legalResponsibleName: null,
      legalResponsibleEmail: null,
      legalResponsiblePhone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as (typeof invoiceRepository.clients)[number]);

    invoiceRepository.projects.push(project as (typeof invoiceRepository.projects)[number]);

    await invoiceRepository.create({
      organizationId,
      projectId: project.id,
      clientId,
      internetBankingProvider: "INTER",
      paymentType: "PIX",
      amount: 1500,
      dueDate: new Date("2026-06-15"),
      description: "Parcela 1",
      status: FinancialStatus.PENDING,
    });

    const result = await sut.execute({
      projectSlug: "projeto-alpha",
      userId,
    });

    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("Parcela 1");
  });

  it("não deve listar faturas de projeto inexistente", async () => {
    await expect(() =>
      sut.execute({
        projectSlug: "inexistente",
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
