import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildDocumensoWebhookEventId,
  normalizeDocumensoWebhookEvent,
} from "@/lib/documenso/webhookEvent";
import { makeChangeContractStatus } from "@/useCases/contract/factories/makeChangeContractStatusUseCase";
import { triggerDigitalBankIntegration } from "@/useCases/banking/triggerDigitalBankIntegration";
import { sendContractReadyEmailForContract } from "@/lib/contracts/contractReadyEmail";
import { apiLogger } from "@/lib/logger";
import { SYSTEM_WEBHOOK_USER_ID } from "@/constants/systemActors";

interface DocumensoWebhookBody {
  event: string;
  payload: { id: number | string };
  createdAt: string;
  webhookEndpoint?: string;
}

export async function POST(req: Request) {
  let eventId: string | undefined;
  let rawBody: DocumensoWebhookBody | undefined;

  try {
    const data = (await req.json()) as DocumensoWebhookBody;
    rawBody = data;
    const payload = data as unknown as Prisma.InputJsonValue;

    const eventType = normalizeDocumensoWebhookEvent(data.event);
    const documentId = String(data.payload.id);
    const deliveredAt = data.createdAt ?? new Date().toISOString();

    eventId = buildDocumensoWebhookEventId({
      eventType,
      documentId,
      deliveredAt,
    });

    console.log("Webhook received:", {
      event: eventType,
      documentId,
      eventId,
    });

    const contract = await prisma.contract.findFirst({
      where: { externalSignId: documentId },
      include: {
        project: {
          include: {
            client: {
              include: {
                organization: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!contract) {
      await prisma.webhookLog.upsert({
        where: { eventId },
        create: {
          provider: "DOCUMENSO",
          eventType,
          documentId,
          eventId,
          payload,
          status: "SKIPPED",
          error: "Contract not found",
        },
        update: {
          payload,
          status: "SKIPPED",
          error: "Contract not found",
        },
      });

      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 },
      );
    }

    const changeStatusUseCase = makeChangeContractStatus();
    const systemUserId = SYSTEM_WEBHOOK_USER_ID;

    switch (eventType) {
      case "DOCUMENT_CREATED":
      case "DOCUMENT_OPENED":
      case "DOCUMENT_SIGNED":
      case "DOCUMENT_RECIPIENT_COMPLETED":
      case "DOCUMENT_REMINDER_SENT":
        break;

      case "DOCUMENT_SENT":
        if (contract.status === "SENT") {
          try {
            await sendContractReadyEmailForContract({
              id: contract.id,
              project: {
                name: contract.project.name,
                client: {
                  slug: contract.project.client.slug,
                  tradeName: contract.project.client.tradeName,
                  companyName: contract.project.client.tradeName,
                  email: contract.project.client.email,
                  responsibleEmail: contract.project.client.responsibleEmail,
                },
              },
            });
          } catch (error) {
            apiLogger.error(
              { err: error, contractId: contract.id },
              "Falha ao enviar ContractReadyEmail via webhook Documenso",
            );
          }
        }
        break;

      case "DOCUMENT_COMPLETED":
        await changeStatusUseCase.execute({
          contractId: contract.id,
          newStatus: "SIGNED",
          userId: systemUserId,
        });

        await triggerDigitalBankIntegration(contract.id);
        break;

      case "DOCUMENT_REJECTED":
        await changeStatusUseCase.execute({
          contractId: contract.id,
          newStatus: "REJECTED",
          userId: systemUserId,
        });
        break;

      case "DOCUMENT_CANCELLED":
        await changeStatusUseCase.execute({
          contractId: contract.id,
          newStatus: "CANCELLED",
          userId: systemUserId,
        });
        break;

      default:
        console.warn(`Unhandled Documenso webhook event: ${eventType}`);
    }

    await prisma.webhookLog.upsert({
      where: { eventId },
      create: {
        provider: "DOCUMENSO",
        eventType,
        documentId,
        eventId,
        payload,
        status: "PROCESSED",
      },
      update: {
        payload,
        status: "PROCESSED",
        error: null,
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook Error:", error);

    if (eventId && rawBody) {
      try {
        await prisma.webhookLog.upsert({
          where: { eventId },
          create: {
            provider: "DOCUMENSO",
            eventType: normalizeDocumensoWebhookEvent(rawBody.event),
            documentId: String(rawBody.payload.id),
            eventId,
            payload: rawBody as unknown as Prisma.InputJsonValue,
            status: "FAILED",
            error: message,
          },
          update: {
            payload: rawBody as unknown as Prisma.InputJsonValue,
            status: "FAILED",
            error: message,
          },
        });
      } catch (logError) {
        console.error("Webhook log persistence error:", logError);
      }
    }

    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
