"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { v } from "@/schemas/validationMessages";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { makeDeleteServiceDefaultBacklogItemUseCase } from "@/useCases/services/backlogs/factories/makeDeleteServiceDefaultBacklogItemUseCase";

// Schema simples apenas para o ID, caso não queira criar um arquivo separado
const deleteBacklogSchema = z.object({
  id: z.cuid(v.invalidBacklogId),
  serviceTypeId: z.string(),
});

type DeleteBacklogType = z.infer<typeof deleteBacklogSchema>;

export async function deleteServiceDefaultBacklogAction(
  data: DeleteBacklogType,
) {
  // 1. Autenticação
  const session = await auth();
  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: await serverErrorMessage("sessionExpired"),
    };
  }

  // 2. Validação
  const parsed = deleteBacklogSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: await serverErrorMessage("invalidId"),
    };
  }

  const { id } = parsed.data;

  try {
    // 3. Instanciação
    const deleteBacklogUseCase = makeDeleteServiceDefaultBacklogItemUseCase();

    // 4. Execução
    await deleteBacklogUseCase.execute({
      id,
      userId: session.user.id,
    });

    revalidatePath(`settings/services/catalog`);
    revalidatePath(`settings/services/catalog/${data.serviceTypeId}/`);

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message, // Ex: "Backlog não encontrado"
      };
    }

    return {
      success: false,
      message: await serverErrorMessage("backlogDeleteFailed"),
    };
  }
}
