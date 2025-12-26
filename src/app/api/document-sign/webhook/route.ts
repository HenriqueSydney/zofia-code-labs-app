// app/api/webhooks/documenso/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makeChangeContractStatus } from "@/useCases/contract/factories/makeChangeContractStatusUseCase";
import { triggerDigitalBankIntegration } from "@/useCases/banking/triggerDigitalBankIntegration";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { event, payload } = data; // Estrutura padrão Documenso

    // O Documenso envia o externalSignId no payload (geralmente data.documentId)
    const externalSignId = String(payload.id);

    // Busca o contrato associado
    const contract = await prisma.contract.findFirst({
      where: { externalSignId },
      include: { project: true },
    });

    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }

    const changeStatusUseCase = makeChangeContractStatus();
    const systemUserId = "SYSTEM_WEBHOOK"; // Usuário virtual para o AuditLog

    switch (event) {
      case "document.created":
        // Apenas dispara o e-mail (ajuste conforme seu serviço de e-mail)
        // Se o e-mail já foi disparado no "SENT" do UseCase, este case pode ser opcional
        // await sendEmailContractLink(contract.id);
        break;

      case "document.completed":
        // Atualiza para SIGNED e dispara lógica de banco digital (dentro do UseCase ou aqui)
        await changeStatusUseCase.execute({
          contractId: contract.id,
          newStatus: "SIGNED",
          userId: systemUserId,
        });
        // Chamar integração banco digital aqui ou via evento de domínio
        await triggerDigitalBankIntegration(contract.id);
        break;

      case "document.rejected":
        await changeStatusUseCase.execute({
          contractId: contract.id,
          newStatus: "REJECTED",
          userId: systemUserId,
        });
        break;

      case "document.cancelled":
        await changeStatusUseCase.execute({
          contractId: contract.id,
          newStatus: "CANCELLED",
          userId: systemUserId,
        });
        break;
    }

    // Salva log de sucesso
    await prisma.webhookLog.create({
      data: {
        provider: "DOCUMENSO",
        eventId: payload.id,
        payload,
        status: "PROCESSED",
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
