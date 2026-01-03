"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { makeCreateOrganizationIntegrationUseCase } from "@/useCases/integration/factories/makeCreateOrganizationTypeUseCase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validamos que recebemos o ID do tipo e um objeto de segredos
const connectSchema = z.object({
  integrationTypeId: z.string().cuid(),
  secretValues: z.record(z.string(), z.string().min(1, "Campo obrigatório")),
});

export async function connectOrganizationIntegrationAction(data: unknown) {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId || !session?.user?.id) {
    return {
      success: false,
      message: "Sessão expirada ou organização não encontrada.",
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
      secretValues: parsed.data.secretValues, // Objeto com múltiplos campos
    });

    revalidatePath("/settings/integration/config");
    return { success: true };
  } catch (error) {
    const message = handleErrors(error);
    return { success: false, message };
  }
}
