"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { updateIntegrationTypeSchema } from "@/schemas/integration/integrationType";
import { makeUpdateIntegrationTypeUseCase } from "@/useCases/integration/factories/makeUpdateIntegrationTypeUseCase";
import { revalidatePath } from "next/cache";

export async function updateIntegrationTypeAction(data: unknown) {
  const session = await auth();
  if (!session?.user) return { success: false, message: await serverErrorMessage("unauthorized") };

  const parsed = updateIntegrationTypeSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: await serverErrorMessage("invalidData") };

  try {
    const useCase = makeUpdateIntegrationTypeUseCase();
    await useCase.execute({ userId: session.user.id, organizationId: session.user.organizationId, ...parsed.data });

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
