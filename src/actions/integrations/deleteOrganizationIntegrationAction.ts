"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { makeDeleteOrganizationIntegrationUseCase } from "@/useCases/integration/factories/makeDeleteOrganizationTypeUseCase";
import { revalidatePath } from "next/cache";

export async function deleteOrganizationIntegrationAction(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId)
    return { success: false, message: "Não autorizado." };

  try {
    const useCase = makeDeleteOrganizationIntegrationUseCase();
    await useCase.execute(id, session.user.id);

    revalidatePath("/settings/integration/config");
    return { success: true };
  } catch (error) {
    const message = handleErrors(error);
    return {
      success: false,
      message,
    };
  }
}
