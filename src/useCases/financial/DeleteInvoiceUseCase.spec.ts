import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FinancialStatus } from "../../generated/prisma/enums";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryInvoiceRepository } from "../../repositories/in-memory/InMemoryInvoiceRepository";
import { DeleteInvoiceUseCase } from "./DeleteInvoiceUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let invoiceRepository: InMemoryInvoiceRepository;
let sut: DeleteInvoiceUseCase;

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

describe("DeleteInvoiceUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invoiceRepository = new InMemoryInvoiceRepository();
    sut = new DeleteInvoiceUseCase(invoiceRepository);
  });

  it("deve excluir fatura existente", async () => {
    const invoice = await seedInvoice();

    await sut.execute({
      id: invoice.id,
      userId: randomUUID(),
    });

    expect(invoiceRepository.items).toHaveLength(0);
  });

  it("não deve excluir fatura inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
