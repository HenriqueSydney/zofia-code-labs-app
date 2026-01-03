"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { makeDeleteIntegrationTypeUseCase } from "@/useCases/integration/factories/makeDeleteIntegrationTypeUseCase";
import { revalidatePath } from "next/cache";

export async function deleteIntegrationTypeAction(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Não autorizado." };

  try {
    const useCase = makeDeleteIntegrationTypeUseCase();
    await useCase.execute(id, session.user.id);

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
