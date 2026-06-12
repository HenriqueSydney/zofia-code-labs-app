"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeCreateOrganizationIntegrationUseCase } from "@/useCases/integration/factories/makeCreateOrganizationTypeUseCase";
import { revalidatePath } from "next/cache";
import { v } from "@/schemas/validationMessages";
import { z } from "zod";

// Validamos que recebemos o ID do tipo e um objeto de segredos
const connectSchema = z.object({
  integrationTypeId: z.cuid(),
  secretValues: z.record(z.string(), z.string().min(1, v.required)),
  enableByol: z.boolean().default(false),
});

export async function connectOrganizationIntegrationAction(data: unknown) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId || !session?.user?.id) {
    return {
      success: false,
      message: await serverErrorMessage("sessionExpiredNoOrg"),
    };
  }

  const parsed = connectSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  try {
    const useCase = makeCreateOrganizationIntegrationUseCase();
    await useCase.execute({
      organizationId,
      userId: session.user.id,
      integrationTypeId: parsed.data.integrationTypeId,
      secretValues: parsed.data.secretValues,
      enableByol: parsed.data.enableByol,
    });

    revalidatePath("/settings/integration/config");
    return { success: true };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, message };
  }
}
