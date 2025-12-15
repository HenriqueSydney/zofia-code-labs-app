"use server";

import { auth } from "@/auth";
import { updateServiceCategorySchema } from "@/schemas/services/updateServiceCategorySchema";
import { makeUpdateServiceCategoryUseCase } from "@/useCases/services/factories/makeUpdateServiceCategoryUseCase";
import { revalidatePath } from "next/cache";

export async function updateServiceCategoryAction(data: unknown) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { success: false, message: "Não autorizado." };
  }

  const parsed = updateServiceCategorySchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, message: "Dados inválidos." };
  }

  const { id, ...rest } = parsed.data;

  try {
    const useCase = makeUpdateServiceCategoryUseCase();

    await useCase.execute({
      id,
      organizationId: session.user.organizationId,
      data: {
        ...rest,
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
