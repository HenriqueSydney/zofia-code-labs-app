"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { makeUpdateOrganizationIntegrationUseCase } from "@/useCases/integration/factories/makeUpdateOrganizationTypeUseCase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateSchema = z.object({
  id: z.string().cuid(),
  enabled: z.boolean().optional(),
  // Aceita um objeto parcial de chaves e valores
  secretValues: z.record(z.string(), z.string().min(1)).optional(),
});

export async function updateOrganizationIntegrationAction(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "Não autorizado." };

  const parsed = updateSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: "Dados inválidos." };

  try {
    const useCase = makeUpdateOrganizationIntegrationUseCase();
    await useCase.execute({
      userId: session.user.id,
      ...parsed.data,
    });

    revalidatePath("/settings/integration/config");
    return { success: true };
  } catch (error) {
    const message = handleErrors(error);
    return { success: false, message };
  }
}
