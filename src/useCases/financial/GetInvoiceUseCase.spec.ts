import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FinancialStatus } from "../../generated/prisma/enums";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryInvoiceRepository } from "../../repositories/in-memory/InMemoryInvoiceRepository";
import { GetInvoiceUseCase } from "./GetInvoiceUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let invoiceRepository: InMemoryInvoiceRepository;
let sut: GetInvoiceUseCase;

async function seedInvoice() {
  const organizationId = randomUUID();
  const clientId = randomUUID();
  const projectId = randomUUID();

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

  invoiceRepository.projects.push({
    id: projectId,
    organizationId,
    clientId,
    name: "Projeto Alpha",
    slug: "projeto-alpha",
    description: null,
    status: "DRAFT",
    priority: "MEDIUM",
    health: "ON_TRACK",
    tags: [],
    estimatedStartDate: null,
    startDate: null,
    endDate: null,
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0,
    createdBy: randomUUID(),
    memberId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as (typeof invoiceRepository.projects)[number]);

  return invoiceRepository.create({
    organizationId,
    projectId,
    clientId,
    internetBankingProvider: "INTER",
    paymentType: "PIX",
    amount: 2500,
    dueDate: new Date("2026-06-15"),
    description: "Parcela 1",
    status: FinancialStatus.PENDING,
  });
}

describe("GetInvoiceUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invoiceRepository = new InMemoryInvoiceRepository();
    sut = new GetInvoiceUseCase(invoiceRepository);
  });

  it("deve retornar fatura por id", async () => {
    const invoice = await seedInvoice();

    const result = await sut.execute({
      id: invoice.id,
      userId: randomUUID(),
    });

    expect(result.id).toBe(invoice.id);
    expect(result.description).toBe("Parcela 1");
  });

  it("não deve retornar fatura inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
