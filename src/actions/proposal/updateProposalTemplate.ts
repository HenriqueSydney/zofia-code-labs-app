"use server";

import { auth } from "@/auth";
import { updateProposalTemplateSchema } from "@/schemas/proposal/updateProposalTemplateSchema";
import { makeUpdateProposalTemplateUseCase } from "@/useCases/proposal/factories/makeUpdateProposalTemplateUseCase";
import { revalidatePath } from "next/cache";

export async function updateProposalTemplateAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Não autorizado" };

  const rawData = {
    proposalId: formData.get("proposalId"),
    content: formData.get("content"),
  };

  const validation = updateProposalTemplateSchema.safeParse(rawData);
  if (!validation.success) {
    console.error("Erro de validação:", validation.error.flatten());
    return { error: "Dados inválidos. Verifique os campos obrigatórios." };
  }

  const useCase = makeUpdateProposalTemplateUseCase();
  const { projectId } = await useCase.execute({
    newContent: validation.data.content,
    userId: session.user.id,
    organizationId: session.user.organizationId,
    proposalId: validation.data.proposalId,
  });

  revalidatePath(`/clients/${client.slug}/projects/${slug}`);
}
