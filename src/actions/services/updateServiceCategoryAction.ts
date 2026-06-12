"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { updateServiceCategorySchema } from "@/schemas/services/updateServiceCategorySchema";
import { makeUpdateServiceCategoryUseCase } from "@/useCases/services/factories/makeUpdateServiceCategoryUseCase";
import { revalidatePath } from "next/cache";

export async function updateServiceCategoryAction(data: unknown) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { success: false, message: await serverErrorMessage("unauthorized") };
  }

  const parsed = updateServiceCategorySchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, message: await serverErrorMessage("invalidData") };
  }

  const { id, ...rest } = parsed.data;

  try {
    const useCase = makeUpdateServiceCategoryUseCase();

    await useCase.execute({
      id,
      organizationId: session.user.organizationId,
      userId: session.user.id,
      data: {
        ...rest,
      },
    });

    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (error) {
    return { success: false, message: await resolveActionErrorMessage(error) };
  }
}
