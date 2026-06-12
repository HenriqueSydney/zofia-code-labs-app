import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FinancialStatus } from "../../generated/prisma/enums";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryInvoiceRepository } from "../../repositories/in-memory/InMemoryInvoiceRepository";
import { UpdateInvoiceStatusUseCase } from "./UpdateInvoiceStatusUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../lib/invoices/invoicePaymentEmails", () => ({
  maybeSendPaymentReceivedEmail: vi.fn().mockResolvedValue(undefined),
}));

let invoiceRepository: InMemoryInvoiceRepository;
let sut: UpdateInvoiceStatusUseCase;

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

describe("UpdateInvoiceStatusUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invoiceRepository = new InMemoryInvoiceRepository();
    sut = new UpdateInvoiceStatusUseCase(invoiceRepository);
  });

  it("deve marcar fatura como paga", async () => {
    const invoice = await seedInvoice();
    const paidAt = new Date("2026-05-20");

    await sut.execute({
      id: invoice.id,
      userId: randomUUID(),
      status: FinancialStatus.PAID,
      paidAt,
    });

    expect(invoiceRepository.items[0].status).toBe(FinancialStatus.PAID);
    expect(invoiceRepository.items[0].paidAt).toEqual(paidAt);

    const { maybeSendPaymentReceivedEmail } = await import(
      "../../lib/invoices/invoicePaymentEmails"
    );
    expect(maybeSendPaymentReceivedEmail).toHaveBeenCalledWith(
      invoice.id,
      paidAt,
    );
  });

  it("deve limpar paidAt ao reverter status", async () => {
    const invoice = await seedInvoice();

    await sut.execute({
      id: invoice.id,
      userId: randomUUID(),
      status: FinancialStatus.PENDING,
    });

    expect(invoiceRepository.items[0].status).toBe(FinancialStatus.PENDING);
    expect(invoiceRepository.items[0].paidAt).toBeNull();
  });

  it("não deve atualizar status de fatura inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        userId: randomUUID(),
        status: FinancialStatus.PAID,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve usar data atual como paidAt quando status PAID sem data informada", async () => {
    const invoice = await seedInvoice();

    await sut.execute({
      id: invoice.id,
      userId: randomUUID(),
      status: FinancialStatus.PAID,
    });

    expect(invoiceRepository.items[0].paidAt).toBeInstanceOf(Date);
  });
});
