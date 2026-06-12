import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FinancialStatus } from "../../generated/prisma/enums";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryInvoiceRepository } from "../../repositories/in-memory/InMemoryInvoiceRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { CreateInvoiceUseCase } from "./CreateInvoiceUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../lib/invoices/invoicePaymentEmails", () => ({
  maybeSendPaymentPendingEmailForInvoiceId: vi.fn().mockResolvedValue(undefined),
}));

let invoiceRepository: InMemoryInvoiceRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: CreateInvoiceUseCase;

describe("CreateInvoiceUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invoiceRepository = new InMemoryInvoiceRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new CreateInvoiceUseCase(invoiceRepository, projectsRepository);
  });

  it("deve criar fatura vinculada ao projeto", async () => {
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

    await sut.execute({
      userId,
      projectSlug: "projeto-alpha",
      internetBankingProvider: "INTER",
      paymentType: "PIX",
      amount: 5000,
      dueDate: new Date("2026-06-15"),
      description: "Parcela 1",
      status: FinancialStatus.PENDING,
    });

    expect(invoiceRepository.items).toHaveLength(1);
    expect(invoiceRepository.items[0].projectId).toBe(project.id);
    expect(invoiceRepository.items[0].organizationId).toBe(organizationId);

    const { maybeSendPaymentPendingEmailForInvoiceId } = await import(
      "../../lib/invoices/invoicePaymentEmails"
    );
    expect(maybeSendPaymentPendingEmailForInvoiceId).toHaveBeenCalledWith(
      invoiceRepository.items[0].id,
    );
  });

  it("não deve criar fatura para projeto inexistente", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        projectSlug: "inexistente",
        internetBankingProvider: "INTER",
        paymentType: "PIX",
        amount: 1000,
        dueDate: new Date("2026-06-15"),
        description: "Fatura",
        status: FinancialStatus.PENDING,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
