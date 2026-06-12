"use server";

import {
  resolveActionErrorMessage,
  resolveSuccessMessage,
  serverErrorMessage,
} from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { integrationTypeSchema } from "@/schemas/integration/integrationType";
import { makeCreateIntegrationTypeUseCase } from "@/useCases/integration/factories/makeCreateIntegrationTypeUseCase";
import { revalidatePath } from "next/cache";

export async function createIntegrationTypeAction(data: unknown) {
  const session = await auth();

  // Aqui você verificaria se o usuário é o ADMIN do sistema
  if (!session?.user) {
    return {
      success: false,
      message: await serverErrorMessage("unauthorized"),
    };
  }

  const parsed = integrationTypeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  try {
    const useCase = makeCreateIntegrationTypeUseCase();
    await useCase.execute({
      userId: session.user.id,
      ...parsed.data,
      organizationId: session.user.organizationId,
    });

    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return {
      success: false,
      message,
    };
  }
}
