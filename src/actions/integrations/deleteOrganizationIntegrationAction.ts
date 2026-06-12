"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeDeleteOrganizationIntegrationUseCase } from "@/useCases/integration/factories/makeDeleteOrganizationTypeUseCase";
import { revalidatePath } from "next/cache";

export async function deleteOrganizationIntegrationAction(id: string) {
  const session = await auth();
  if (!session?.user?.organizationId)
    return { success: false, message: await serverErrorMessage("unauthorized") };

  try {
    const useCase = makeDeleteOrganizationIntegrationUseCase();
    await useCase.execute(id, session.user.id);

    revalidatePath("/settings/integration/config");
    return { success: true };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return {
      success: false,
      message,
    };
  }
}
