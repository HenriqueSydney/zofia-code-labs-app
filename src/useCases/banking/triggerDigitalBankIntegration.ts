// triggerDigitalBankIntegration.ts
import { ValidationError } from "@/errors";
import { PROJECT_STATUS_FLOW } from "@/domain/project/ProjectWorkflow";
import { sendPaymentPendingEmailForInvoice } from "@/lib/invoices/invoicePaymentEmails";
import {
  InternetBankingProvider,
  InvoiceChargeType,
  PaymentType,
  ProjectStatus,
} from "@/generated/prisma/client";
import { maybeSendWelcomeClientEmail } from "@/lib/clients/welcomeClientEmail";
import { date } from "@/lib/dayjs";
import { prisma } from "@/lib/prisma";
import { makeContractRepository } from "@/repositories/factories/makeContractRepository";
import { makeInvoiceRepository } from "@/repositories/factories/makeInvoiceRepository";
import {
  IntegrationFactory,
  IntegrationType,
} from "@/services/IntegrationFactory";
import {
  IPaymentGatewayService,
  PaymentMethodType,
} from "@/services/paymentGateway/IPaymentGatewayService";
import { makeChangeProjectStatusUseCase } from "@/useCases/projects/factories/makeChangeProjectStatusUseCase";

const PAYMENT_GATEWAY_SLUGS = new Set<string>([
  IntegrationType.STRIPE,
  IntegrationType.MERCADO_PAGO,
  IntegrationType.INTER,
]);

const DOWN_PAYMENT_DUE_DAYS = 3;

function resolveIntegrationType(slug: string): IntegrationType | null {
  if (PAYMENT_GATEWAY_SLUGS.has(slug)) return slug as IntegrationType;
  return null;
}

function resolveInternetBankingProvider(slug: string): InternetBankingProvider {
  const map: Record<string, InternetBankingProvider> = {
    [IntegrationType.STRIPE]: "STRIPE",
    [IntegrationType.MERCADO_PAGO]: "MERCADO_PAGO",
    [IntegrationType.INTER]: "INTER",
  };
  const provider = map[slug];
  if (!provider) throw new ValidationError(`Gateway não suportado: ${slug}`);
  return provider;
}

function resolvePaymentMethodType(
  paymentMethod: string | null | undefined,
): PaymentMethodType {
  const normalized = paymentMethod?.toLowerCase().trim();
  if (normalized === "boleto") return "boleto";
  if (normalized === "cartão de crédito" || normalized === "cartao de credito")
    return "card";
  return "pix";
}

/** Stripe ainda não suporta Pix no Brasil — converte para boleto. */
function resolveGatewayPaymentMethodType(
  integrationType: IntegrationType,
  paymentMethodType: PaymentMethodType,
): PaymentMethodType {
  if (
    integrationType === IntegrationType.STRIPE &&
    paymentMethodType === "pix"
  ) {
    return "boleto";
  }
  return paymentMethodType;
}

function resolveInvoicePaymentType(type: PaymentMethodType): PaymentType {
  const map: Record<PaymentMethodType, PaymentType> = {
    pix: "PIX",
    boleto: "BOLETO",
    card: "CREDIT_CARD",
  };
  return map[type];
}

function calculateDownPaymentAmountCents(proposal: {
  totalValue: { toNumber(): number };
  downPaymentPercentage: number;
}): number {
  return Math.round(
    proposal.totalValue.toNumber() *
      (proposal.downPaymentPercentage / 100) *
      100,
  );
}

function centsToReais(cents: number): number {
  return Math.round(cents) / 100;
}

function parsePhone(phone: string): { ddd?: string; phone?: string } {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    return { ddd: digits.slice(0, 2), phone: digits.slice(2) };
  }
  return { phone: digits || undefined };
}

// fix: recebe documento já sanitizado
function resolvePersonType(sanitizedDocument: string): "FISICA" | "JURIDICA" {
  return sanitizedDocument.length > 11 ? "JURIDICA" : "FISICA";
}

function buildDueDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + DOWN_PAYMENT_DUE_DAYS);
  return d;
}

async function advanceProjectToStatus(
  projectId: string,
  userId: string,
  targetStatus: ProjectStatus,
  observation: string,
  currentStatus?: ProjectStatus,
) {
  const changeProjectStatusUseCase = makeChangeProjectStatusUseCase();
  const targetIndex = PROJECT_STATUS_FLOW.indexOf(targetStatus);
  if (targetIndex === -1) return;

  // fix: evita query extra quando o status atual já é conhecido
  let status =
    currentStatus ??
    (
      await prisma.project.findUnique({
        where: { id: projectId },
        select: { status: true },
      })
    )?.status;

  while (status && status !== targetStatus) {
    const currentIndex = PROJECT_STATUS_FLOW.indexOf(status);
    if (currentIndex === -1 || currentIndex >= targetIndex) break;

    const nextStatus = PROJECT_STATUS_FLOW[currentIndex + 1];
    if (!nextStatus) break;

    const updated = await changeProjectStatusUseCase.execute({
      projectId,
      newStatus: nextStatus,
      userId,
      data: { observation },
    });

    // fix: usa retorno do use case em vez de re-query
    status = updated?.status ?? nextStatus;
  }
}

export async function triggerDigitalBankIntegration(contractId: string) {
  const contractRepository = makeContractRepository();
  const invoiceRepository = makeInvoiceRepository();

  // fix: expandir findById para incluir campos do client evitando double fetch
  const contract = await contractRepository.findById(contractId);
  if (!contract) return;

  const proposal = await prisma.proposal.findUnique({
    where: { id: contract.proposalId },
    select: {
      paymentGatewayId: true,
      paymentMethod: true,
      totalValue: true,
      downPaymentPercentage: true,
    },
  });
  if (!proposal) return;

  const downPaymentAmountCents = calculateDownPaymentAmountCents(proposal);
  const hasDownPayment =
    proposal.downPaymentPercentage > 0 && downPaymentAmountCents > 0;

  if (!hasDownPayment) {
    await advanceProjectToStatus(
      contract.projectId,
      contract.createdBy,
      "PLANNED",
      "Contrato assinado — sem entrada a receber.",
    );

    await maybeSendWelcomeClientEmail({
      client: {
        id: contract.project.client.id,
        email: contract.project.client.email,
        responsibleEmail: contract.project.client.responsibleEmail ?? null,
        tradeName: contract.project.client.tradeName,
        companyName: contract.project.client.companyName,
      },
      projectId: contract.projectId,
      projectName: contract.project.name,
      source: "contract_signed_no_down_payment",
    });

    return;
  }

  const paymentGatewayId = proposal.paymentGatewayId ?? "cash";

  if (paymentGatewayId === "cash") {
    await advanceProjectToStatus(
      contract.projectId,
      contract.createdBy,
      "WAITING_DOWN_PAYMENT",
      "Contrato assinado — pagamento manual.",
    );
    return;
  }

  const integrationType = resolveIntegrationType(paymentGatewayId);
  if (!integrationType) {
    throw new ValidationError(`Gateway não suportado: ${paymentGatewayId}`);
  }

  const paymentMethodType = resolveGatewayPaymentMethodType(
    integrationType,
    resolvePaymentMethodType(proposal.paymentMethod),
  );

  if (
    integrationType === IntegrationType.INTER &&
    paymentMethodType === "card"
  ) {
    throw new ValidationError(
      "O Banco Inter não suporta cobrança via cartão de crédito.",
    );
  }

  await advanceProjectToStatus(
    contract.projectId,
    contract.createdBy,
    "WAITING_DOWN_PAYMENT",
    "Contrato assinado — aguardando pagamento da entrada.",
  );

  // fix: busca campos extras do client em uma query só
  // (idealmente mover pro include do contractRepository.findById)
  const client = await prisma.client.findUnique({
    where: { id: contract.project.client.id },
    select: {
      cnpj: true,
      email: true,
      tradeName: true,
      phone: true,
      address: true,
      responsibleEmail: true,
    },
  });
  if (!client) return;

  const dueDate = buildDueDate();
  const downPaymentInReais = centsToReais(downPaymentAmountCents);
  const customerEmail =
    client.responsibleEmail ?? contract.project.client.email ?? client.email;
  const invoiceDescription = `Entrada — Contrato #${contract.id.slice(-8)}`;

  // fix: cria como DRAFT — promove para PENDING só após gateway confirmar
  const invoice = await invoiceRepository.create({
    organizationId: contract.project.organizationId,
    projectId: contract.projectId,
    clientId: contract.project.client.id,
    internetBankingProvider: resolveInternetBankingProvider(paymentGatewayId),
    paymentType: resolveInvoicePaymentType(paymentMethodType),
    chargeType: InvoiceChargeType.DOWN_PAYMENT,
    amount: downPaymentInReais,
    dueDate,
    description: invoiceDescription,
    status: "DRAFT",
  });

  try {
    const integrationFactory = new IntegrationFactory();
    const bankingService =
      await integrationFactory.getIntegration<IPaymentGatewayService>({
        organizationId: contract.project.organizationId,
        type: integrationType,
      });

    let customerId: string | undefined;
    if (integrationType === IntegrationType.STRIPE) {
      const customer = await bankingService.createCustomer(
        customerEmail,
        contract.project.client.tradeName,
        contract.project.organizationId,
      );
      customerId = customer.gatewayCustomerId ?? undefined;
    }

    const phoneParts = parsePhone(client.phone);
    // fix: sanitiza antes de usar em resolvePersonType
    const payerDocument = client.cnpj.replace(/\D/g, "");

    const paymentData = {
      type: paymentMethodType,
      amount: downPaymentAmountCents,
      currency: "BRL",
      customerEmail,
      customerId,
      invoiceId: invoice.id,
      organizationId: contract.project.organizationId,
      description: invoiceDescription,
      payer: {
        name: contract.project.client.tradeName,
        document: payerDocument,
        // fix: passa documento sanitizado
        personType: resolvePersonType(payerDocument),
        email: customerEmail,
        phone: phoneParts.phone,
        ddd: phoneParts.ddd,
        address: client.address ?? undefined,
      },
    };

    // fix: bifurca entre checkout session (card) e payment intent (pix/boleto)
    const paymentResult =
      paymentMethodType === "card"
        ? await bankingService.createCheckoutSession(paymentData)
        : await bankingService.createPaymentIntent(paymentData);

    // fix: promove para PENDING após gateway confirmar
    await invoiceRepository.update(invoice.id, {
      status: "PENDING",
      description: `${invoiceDescription} [gateway:${paymentResult.id}]`,
    });

    const updatedInvoice = await invoiceRepository.findById(invoice.id);
    if (!updatedInvoice) return;

    await sendPaymentPendingEmailForInvoice(updatedInvoice, {
      paymentLink:
        paymentMethodType === "card" ? paymentResult.checkoutUrl : undefined,
      pixQrCodeBase64:
        paymentMethodType === "pix" ? paymentResult.pixQrCodeBase64 : undefined,
      pixCopyPaste:
        paymentMethodType === "pix" ? paymentResult.pixCopyPaste : undefined,
      boletoUrl:
        paymentMethodType === "boleto" ? paymentResult.boletoUrl : undefined,
    });
  } catch (error) {
    await invoiceRepository.updateStatus(invoice.id, "CANCELLED", null);
    throw error;
  }
}
