"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { makeUpdateOrganizationIntegrationUseCase } from "@/useCases/integration/factories/makeUpdateOrganizationTypeUseCase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateSchema = z.object({
  id: z.cuid(),
  enabled: z.boolean().optional(),
  secretValues: z.record(z.string(), z.string().min(1)).optional(),
  enableByol: z.boolean().default(false),
});

export async function updateOrganizationIntegrationAction(data: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: await serverErrorMessage("unauthorized") };

  const parsed = updateSchema.safeParse(data);
  if (!parsed.success) return { success: false, message: await serverErrorMessage("invalidData") };

  try {
    const useCase = makeUpdateOrganizationIntegrationUseCase();
    await useCase.execute({
      userId: session.user.id,
      ...parsed.data,
    });

    revalidatePath("/settings/integration/config");
    return { success: true };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, message };
  }
}
