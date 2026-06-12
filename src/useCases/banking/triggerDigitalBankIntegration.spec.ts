import { randomUUID } from "node:crypto";
import { Decimal } from "@prisma/client/runtime/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFindById,
  mockGetIntegration,
  mockCreatePaymentIntent,
  mockCreateCustomer,
  mockInvoiceCreate,
  mockInvoiceUpdate,
  mockInvoiceFindById,
  mockInvoiceUpdateStatus,
  mockChangeProjectStatusExecute,
  mockProposalFindUnique,
  mockClientFindUnique,
  mockProjectFindUnique,
  mockSendPaymentPendingEmail,
  mockMaybeSendWelcomeClientEmail,
} = vi.hoisted(() => ({
  mockFindById: vi.fn(),
  mockGetIntegration: vi.fn(),
  mockCreatePaymentIntent: vi.fn(),
  mockCreateCustomer: vi.fn(),
  mockInvoiceCreate: vi.fn(),
  mockInvoiceUpdate: vi.fn(),
  mockInvoiceFindById: vi.fn(),
  mockInvoiceUpdateStatus: vi.fn(),
  mockChangeProjectStatusExecute: vi.fn(),
  mockProposalFindUnique: vi.fn(),
  mockClientFindUnique: vi.fn(),
  mockProjectFindUnique: vi.fn(),
  mockSendPaymentPendingEmail: vi.fn(),
  mockMaybeSendWelcomeClientEmail: vi.fn(),
}));

vi.mock("@/repositories/factories/makeContractRepository", () => ({
  makeContractRepository: vi.fn(() => ({
    findById: mockFindById,
  })),
}));

vi.mock("@/repositories/factories/makeInvoiceRepository", () => ({
  makeInvoiceRepository: vi.fn(() => ({
    create: mockInvoiceCreate,
    update: mockInvoiceUpdate,
    findById: mockInvoiceFindById,
    updateStatus: mockInvoiceUpdateStatus,
  })),
}));

vi.mock("@/useCases/projects/factories/makeChangeProjectStatusUseCase", () => ({
  makeChangeProjectStatusUseCase: vi.fn(() => ({
    execute: mockChangeProjectStatusExecute,
  })),
}));

vi.mock("@/services/IntegrationFactory", () => ({
  IntegrationFactory: class {
    getIntegration = mockGetIntegration;
  },
  IntegrationType: {
    STRIPE: "stripe",
    MERCADO_PAGO: "mercado-pago",
    INTER: "inter",
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    proposal: { findUnique: mockProposalFindUnique },
    client: { findUnique: mockClientFindUnique },
    project: { findUnique: mockProjectFindUnique },
  },
}));

vi.mock("@/email/send", () => ({
  sendPaymentPendingEmail: mockSendPaymentPendingEmail,
}));

vi.mock("@/lib/clients/welcomeClientEmail", () => ({
  maybeSendWelcomeClientEmail: mockMaybeSendWelcomeClientEmail,
}));

import { triggerDigitalBankIntegration } from "./triggerDigitalBankIntegration";

describe("triggerDigitalBankIntegration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCreatePaymentIntent.mockResolvedValue({
      id: "pi_123",
      clientSecret: "secret_abc",
      status: "pending",
      amount: 45000,
      currency: "brl",
    });
    mockCreateCustomer.mockResolvedValue({
      gatewayCustomerId: "cus_123",
    });
    mockGetIntegration.mockResolvedValue({
      createPaymentIntent: mockCreatePaymentIntent,
      createCustomer: mockCreateCustomer,
    });
    mockInvoiceCreate.mockResolvedValue({ id: randomUUID() });
    mockInvoiceUpdate.mockResolvedValue({});
    mockProjectFindUnique.mockResolvedValue({ status: "WAITING_DOWN_PAYMENT" });
    mockMaybeSendWelcomeClientEmail.mockResolvedValue(undefined);
  });

  function mockProjectStatusProgression(statuses: string[]) {
    let call = 0;
    mockProjectFindUnique.mockImplementation(async () => {
      const status = statuses[Math.min(call, statuses.length - 1)];
      call += 1;
      return { status };
    });
  }

  it("deve retornar cedo quando contrato não existe", async () => {
    mockFindById.mockResolvedValue(null);

    await triggerDigitalBankIntegration(randomUUID());

    expect(mockFindById).toHaveBeenCalledTimes(1);
    expect(mockGetIntegration).not.toHaveBeenCalled();
  });

  it("deve avançar para PLANNED quando não há entrada", async () => {
    const contractId = randomUUID();
    const projectId = randomUUID();
    const clientId = randomUUID();

    mockFindById.mockResolvedValue({
      id: contractId,
      proposalId: randomUUID(),
      projectId,
      createdBy: randomUUID(),
      project: {
        organizationId: randomUUID(),
        name: "Projeto ERP",
        slug: "projeto-erp",
        client: {
          id: clientId,
          tradeName: "Acme Corp",
          email: "contato@acme.com",
          slug: "acme",
          responsibleEmail: "financeiro@acme.com",
        },
      },
    });
    mockProposalFindUnique.mockResolvedValue({
      paymentGatewayId: "stripe",
      paymentMethod: "pix",
      totalValue: new Decimal(1500),
      downPaymentPercentage: 0,
    });
    mockProjectStatusProgression(["WAITING_DOWN_PAYMENT", "PLANNED"]);

    await triggerDigitalBankIntegration(contractId);

    expect(mockChangeProjectStatusExecute).toHaveBeenCalledWith(
      expect.objectContaining({ newStatus: "PLANNED" }),
    );
    expect(mockGetIntegration).not.toHaveBeenCalled();
    expect(mockMaybeSendWelcomeClientEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        client: expect.objectContaining({ id: clientId }),
        projectId,
        projectName: "Projeto ERP",
        source: "contract_signed_no_down_payment",
      }),
    );
  });

  it("deve avançar para WAITING_DOWN_PAYMENT em pagamento cash", async () => {
    const contractId = randomUUID();

    mockFindById.mockResolvedValue({
      id: contractId,
      proposalId: randomUUID(),
      projectId: randomUUID(),
      createdBy: randomUUID(),
    });
    mockProposalFindUnique.mockResolvedValue({
      paymentGatewayId: "cash",
      paymentMethod: null,
      totalValue: new Decimal(1500),
      downPaymentPercentage: 30,
    });
    mockProjectStatusProgression([
      "WAITING_SIGNATURE",
      "WAITING_DOWN_PAYMENT",
    ]);

    await triggerDigitalBankIntegration(contractId);

    expect(mockChangeProjectStatusExecute).toHaveBeenCalledWith(
      expect.objectContaining({ newStatus: "WAITING_DOWN_PAYMENT" }),
    );
    expect(mockGetIntegration).not.toHaveBeenCalled();
  });

  it("deve criar fatura e cobrança no gateway digital", async () => {
    const organizationId = randomUUID();
    const contractId = randomUUID();
    const proposalId = randomUUID();
    const projectId = randomUUID();
    const clientId = randomUUID();
    const invoiceId = randomUUID();
    const createdBy = randomUUID();

    mockFindById.mockResolvedValue({
      id: contractId,
      proposalId,
      projectId,
      createdBy,
      project: {
        organizationId,
        name: "Projeto ERP",
        client: {
          id: clientId,
          tradeName: "Acme Corp",
          email: "contato@acme.com",
        },
      },
    });
    mockProposalFindUnique.mockResolvedValue({
      paymentGatewayId: "stripe",
      paymentMethod: "pix",
      totalValue: new Decimal(1500),
      downPaymentPercentage: 30,
    });
    mockClientFindUnique.mockResolvedValue({
      cnpj: "12345678000199",
      email: "contato@acme.com",
      tradeName: "Acme Corp",
      phone: "11999999999",
      address: "Rua A, 100",
      responsibleEmail: "financeiro@acme.com",
    });
    mockInvoiceCreate.mockResolvedValue({ id: invoiceId });
    mockInvoiceFindById.mockResolvedValue({
      id: invoiceId,
      status: "PENDING",
      amount: 450,
      dueDate: new Date("2026-06-14"),
      description: "Entrada — Contrato #abc [gateway:pi_123]",
      paymentType: "BOLETO",
      client: {
        tradeName: "Acme Corp",
        companyName: "Acme Corp",
        email: "contato@acme.com",
        responsibleEmail: "financeiro@acme.com",
        slug: "acme",
      },
      project: {
        name: "Projeto ERP",
        slug: "projeto-erp",
      },
    });
    mockProjectStatusProgression([
      "WAITING_SIGNATURE",
      "WAITING_DOWN_PAYMENT",
    ]);

    await triggerDigitalBankIntegration(contractId);

    expect(mockGetIntegration).toHaveBeenCalledWith({
      organizationId,
      type: "stripe",
    });
    expect(mockInvoiceCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId,
        projectId,
        clientId,
        internetBankingProvider: "STRIPE",
        paymentType: "BOLETO",
        chargeType: "DOWN_PAYMENT",
        amount: 450,
        status: "DRAFT",
      }),
    );
    expect(mockCreateCustomer).toHaveBeenCalledWith(
      "financeiro@acme.com",
      "Acme Corp",
    );
    expect(mockCreatePaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "boleto",
        amount: 45000,
        currency: "BRL",
        invoiceId,
        organizationId,
        customerId: "cus_123",
        customerEmail: "financeiro@acme.com",
      }),
    );
    expect(mockInvoiceUpdate).toHaveBeenCalledWith(
      invoiceId,
      expect.objectContaining({
        description: expect.stringContaining("[gateway:pi_123]"),
      }),
    );
    expect(mockSendPaymentPendingEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "financeiro@acme.com",
        invoiceId,
        paymentMethodType: "boleto",
        servicesDescription: "Projeto ERP",
      }),
    );
  });

  it("deve cancelar fatura quando gateway falhar", async () => {
    const invoiceId = randomUUID();

    mockFindById.mockResolvedValue({
      id: randomUUID(),
      proposalId: randomUUID(),
      projectId: randomUUID(),
      createdBy: randomUUID(),
      project: {
        organizationId: randomUUID(),
        name: "Projeto ERP",
        client: {
          id: randomUUID(),
          tradeName: "Acme Corp",
          email: "contato@acme.com",
        },
      },
    });
    mockProposalFindUnique.mockResolvedValue({
      paymentGatewayId: "stripe",
      paymentMethod: "pix",
      totalValue: new Decimal(1500),
      downPaymentPercentage: 30,
    });
    mockClientFindUnique.mockResolvedValue({
      cnpj: "12345678000199",
      email: "contato@acme.com",
      tradeName: "Acme Corp",
      phone: "11999999999",
      address: null,
      responsibleEmail: null,
    });
    mockInvoiceCreate.mockResolvedValue({ id: invoiceId });
    mockCreatePaymentIntent.mockRejectedValue(new Error("Gateway offline"));
    mockProjectFindUnique.mockResolvedValue({ status: "WAITING_DOWN_PAYMENT" });

    await expect(triggerDigitalBankIntegration(randomUUID())).rejects.toThrow(
      "Gateway offline",
    );

    expect(mockInvoiceUpdateStatus).toHaveBeenCalledWith(
      invoiceId,
      "CANCELLED",
      null,
    );
    expect(mockSendPaymentPendingEmail).not.toHaveBeenCalled();
  });
});
