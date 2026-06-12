"use server";

import {
  resolveActionErrorMessage,
  resolveSuccessMessage,
  serverErrorMessage,
} from "@/errors/resolveActionErrorMessage";
import { forgotPasswordSchema } from "@/schemas/auth/forgotPasswordSchema";
import { makeRequestPasswordResetUseCase } from "@/useCases/auth/factories/makeRequestPasswordResetUseCase";

export async function requestPasswordResetAction(data: unknown) {
  const parsed = forgotPasswordSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: await serverErrorMessage("invalidData"),
    };
  }

  try {
    const useCase = await makeRequestPasswordResetUseCase();

    await useCase.execute({
      email: parsed.data.email,
    });

    return {
      success: true,
      message: await resolveSuccessMessage("passwordResetEmailSent"),
    };
  } catch (error) {
    return {
      success: false,
      message: await resolveActionErrorMessage(error),
    };
  }
}
