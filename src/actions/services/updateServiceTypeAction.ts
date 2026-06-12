"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import {
  UpdateServiceTypeSchema,
  updateServiceTypeSchema,
} from "@/schemas/services/updateServiceTypeSchema";
import { makeUpdateServiceTypeUseCase } from "@/useCases/services/factories/makeUpdateServiceUseCase";
import { revalidatePath } from "next/cache";

export async function updateServiceTypeAction(data: UpdateServiceTypeSchema) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { success: false, message: await serverErrorMessage("unauthorized") };
  }

  const parsed = updateServiceTypeSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message || await serverErrorMessage("invalidData"),
    };
  }

  const { id, basePrice, ...rest } = parsed.data;

  // Lógica de Preço: 0 vira null
  const finalPrice =
    basePrice === 0 || basePrice === undefined ? null : basePrice;

  try {
    const useCase = makeUpdateServiceTypeUseCase();

    await useCase.execute({
      id,
      organizationId: session.user.organizationId,
      userId: session.user.id,
      data: {
        ...rest,
        basePrice: finalPrice,
      },
    });

    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (error) {
    return { success: false, message: await resolveActionErrorMessage(error) };
  }
}
