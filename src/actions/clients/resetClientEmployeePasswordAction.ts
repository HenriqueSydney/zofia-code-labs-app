"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeResetClientEmployeePasswordUseCase } from "@/useCases/clients/factories/makeResetClientEmployeePasswordUseCase";

export async function resetClientEmployeePasswordAction(
  employeeId: string,
  slug: string
) {
  const session = await auth();

  if (!session) {
    throw new UnauthorizedError("notLoggedIn");
  }

  try {
    const resetClientEmployeePasswordUseCase =
      makeResetClientEmployeePasswordUseCase();

    await resetClientEmployeePasswordUseCase.execute({
      userId: session.user.id,
      clientSlug: slug,
      employeeId,
    });

    return { success: true, message: await resolveSuccessMessage("passwordReset") };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, message };
  }
}
