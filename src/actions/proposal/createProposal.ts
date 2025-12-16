"use server";

import { auth } from "@/auth";
import { makeCreateProposalUseCase } from "@/useCases/proposal/factories/makeCreateProposalUseCase";
import { revalidatePath } from "next/cache";

export async function createProposalAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  // 1. Parse dos dados simples
  const documentTemplateId = formData.get("templateId");

  const rawData = {
    documentTemplateId: formData.get("documentTemplateId"),
    projectId: formData.get("projectId"),
  };

  // 2. Validação Zod
  const validation = proposalFormSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const file = formData.get("document");

  if (!(file instanceof File && file.size > 0)) {
    return { error: "Arquivo inválido" };
  }

  const useCase = makeCreateProposalUseCase();
  try {
    const project = await useCase.execute({
      generatedProjectId: projectId,
      documentTemplateId,
      totalValue,
      createdBy,
      validUntil,
      items,
      file,
      userId: session.user.id,
      organizationId: session.user.organizationId,
    });

    revalidatePath(`/projects/${projectId}/dashboard`);
  } catch (error) {
    console.error(error);
    return { error: "Erro ao criar a proposta comercial." };
  }
}
