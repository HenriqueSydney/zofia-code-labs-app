"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { makeResetClientEmployeePasswordUseCase } from "@/useCases/clients/factories/makeResetClientEmployeePasswordUseCase";

export async function resetClientEmployeePasswordAction(
  employeeId: string,
  slug: string
) {
  const session = await auth();

  if (!session) {
    throw new AppError("Usuário não logado.");
  }

  try {
    const resetClientEmployeePasswordUseCase =
      makeResetClientEmployeePasswordUseCase();

    await resetClientEmployeePasswordUseCase.execute({
      userId: session.user.id,
      clientSlug: slug,
      employeeId,
    });

    return { success: true, message: "Senha redefinida com sucesso." };
  } catch (error) {
    const message = handleErrors(error);
    return { success: false, message };
  }
}
