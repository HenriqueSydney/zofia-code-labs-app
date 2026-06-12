"use server";

import {
  resolveActionErrorMessage,
  resolveSuccessMessage,
  serverErrorMessage,
} from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeDeleteIntegrationTypeUseCase } from "@/useCases/integration/factories/makeDeleteIntegrationTypeUseCase";
import { revalidatePath } from "next/cache";

export async function deleteIntegrationTypeAction(id: string) {
  const session = await auth();
  if (!session?.user)
    return {
      success: false,
      message: await serverErrorMessage("unauthorized"),
    };

  try {
    const useCase = makeDeleteIntegrationTypeUseCase();
    await useCase.execute(id, session.user.id, session.user.organizationId);

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
