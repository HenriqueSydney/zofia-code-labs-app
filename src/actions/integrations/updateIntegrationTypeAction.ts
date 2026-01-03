"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { updateIntegrationTypeSchema } from "@/schemas/integration/integrationType";
import { makeUpdateIntegrationTypeUseCase } from "@/useCases/integration/factories/makeUpdateIntegrationTypeUseCase";
import { revalidatePath } from "next/cache";

export async function updateIntegrationTypeAction(data: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Não autorizado." };

  const parsed = updateIntegrationTypeSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: "Dados inválidos." };

  try {
    const useCase = makeUpdateIntegrationTypeUseCase();
    await useCase.execute({ userId: session.user.id, ...parsed.data });

    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    const message = handleErrors(error);
    return {
      success: false,
      message,
    };
  }
}
