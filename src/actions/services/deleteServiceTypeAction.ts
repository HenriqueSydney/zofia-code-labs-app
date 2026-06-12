"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeDeleteServiceTypeUseCase } from "@/useCases/services/factories/makeDeleteServiceUseCase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema simples apenas para garantir que o ID é válido antes de processar
const deleteSchema = z.object({
  id: z.string().cuid(),
});

export async function deleteServiceTypeAction(id: string) {
  const session = await auth();
  
  if (!session?.user?.organizationId) {
    return { success: false, message: await serverErrorMessage("unauthorized") };
  }

  const parsed = deleteSchema.safeParse({ id });

  if (!parsed.success) {
    return { success: false, message: await serverErrorMessage("invalidId") };
  }

  try {
    const useCase = makeDeleteServiceTypeUseCase()

    await useCase.execute({
      id,
      organizationId: session.user.organizationId,
      userId: session.user.id,
    });

    revalidatePath("/dashboard/services");
    return { success: true };

  } catch (error) {
    if (error instanceof Error) return { success: false, message: error.message };
    return { success: false, message: await serverErrorMessage("serviceDeleteFailed") };
  }
}