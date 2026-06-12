"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { updateContractTemplateSchema } from "@/schemas/contract/updateContractTemplateSchema";
import { makeUpdateContractTemplateUseCase } from "@/useCases/contract/factories/makeUpdateContractTemplateUseCase";
import { revalidatePath } from "next/cache";

export async function updateContractTemplateAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: await serverErrorMessage("unauthorized") };

  const rawData = {
    contractId: formData.get("contractId"),
    content: formData.get("content"),
  };

  const validation = updateContractTemplateSchema.safeParse(rawData);
  if (!validation.success) {
    console.error("Erro de validação:", validation.error.flatten());
    return { error: await serverErrorMessage("checkFormFields") };
  }

  const useCase = makeUpdateContractTemplateUseCase();
  const { slug, clientSlug } = await useCase.execute({
    newContent: validation.data.content,
    userId: session.user.id,
    organizationId: session.user.organizationId,
    contractId: validation.data.contractId,
  });

  revalidatePath(`/clients/${clientSlug}/projects/${slug}`);
}
