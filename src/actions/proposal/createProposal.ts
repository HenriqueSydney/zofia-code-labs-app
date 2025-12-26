"use server";

import { auth } from "@/auth";
import { Proposal } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import { createProposalSchema } from "@/schemas/proposal/createProposalSchema";
import { makeCreateProposalUseCase } from "@/useCases/proposal/factories/makeCreateProposalUseCase";
import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";

export async function createProposalAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  let itemsParsed = [];
  const itemsRaw = formData.get("items");
  if (itemsRaw && typeof itemsRaw === "string") {
    try {
      itemsParsed = JSON.parse(itemsRaw);
    } catch (e) {
      console.error("Erro ao fazer parse dos itens:", e);
      return { error: "Dados dos itens inválidos." };
    }
  }

  const fileRaw = formData.get("document");
  const file =
    fileRaw instanceof File && fileRaw.size > 0 ? fileRaw : undefined;

  const rawData = {
    documentTemplateId: formData.get("documentTemplateId"),
    projectId: formData.get("projectId"),
    document: file,
    items: itemsParsed,
    downPaymentPercentage: Number(formData.get("downPaymentPercentage")),
    validUntil: date(String(formData.get("validUntil"))).toDate(),
  };

  // 2. Validação Zod
  const validation = createProposalSchema.safeParse(rawData);
  if (!validation.success) {
    console.error("Erro de validação:", validation.error.flatten());
    return { error: "Dados inválidos. Verifique os campos obrigatórios." };
  }

  const useCase = makeCreateProposalUseCase();
  let success: Proposal;
  try {
    const proposal = await useCase.execute({
      projectId: validation.data.projectId,
      documentTemplateId: validation.data.documentTemplateId,
      createdBy: session.user.id,
      downPaymentPercentage: validation.data.downPaymentPercentage,
      organizationId: session.user.organizationId,
      validUntil: validation.data.validUntil,
      items: validation.data.items,
      file,
    });

    success = proposal;
  } catch (error) {
    console.error(error);
    return { error: "Erro ao criar a proposta comercial." };
  }

  if (success) {
    revalidatePath(`/projects/${success.projectId}/project`);
    revalidatePath(
      `/projects/${success.projectId}/project/commercial/proposal`
    );
    redirect(
      `/projects/${success.projectId}/project/commercial/proposals?success=true`,
      RedirectType.push
    );
  }
}
