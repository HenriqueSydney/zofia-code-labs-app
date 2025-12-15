"use server";

import { auth } from "@/auth";
import { updateServiceTypeSchema } from "@/schemas/services/updateServiceTypeSchema";
import { makeUpdateServiceTypeUseCase } from "@/useCases/services/factories/makeUpdateServiceUseCase";
import { revalidatePath } from "next/cache";

export async function updateServiceTypeAction(data: unknown) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { success: false, message: "Não autorizado." };
  }

  const parsed = updateServiceTypeSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, message: "Dados inválidos." };
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
      data: {
        ...rest,
        basePrice: finalPrice,
      },
    });

    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (error) {
    if (error instanceof Error)
      return { success: false, message: error.message };
    return { success: false, message: "Erro ao atualizar serviço." };
  }
}
