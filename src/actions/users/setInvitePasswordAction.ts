"use server";

import { auth } from "@/auth";
import { INVITE_PASSWORD_SETUP_COOKIE } from "@/constants/orgInvite";
import {
  resolveActionErrorMessage,
  resolveSuccessMessage,
  serverErrorMessage,
} from "@/errors/resolveActionErrorMessage";
import { extractClientIp } from "@/lib/auth/extractClientIp";
import { v } from "@/schemas/validationMessages";
import { SetInvitePasswordUseCase } from "@/useCases/users/SetInvitePasswordUseCase";
import { PrismaUsersRepository } from "@/repositories/prisma/PrismaUsersRepository";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const setInvitePasswordSchema = z
  .object({
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: v.passwordsMismatch,
    path: ["confirmPassword"],
  });

export type SetInvitePasswordState = {
  success: boolean;
  message?: string;
  errors?: {
    newPassword?: string[];
    confirmPassword?: string[];
  };
};

export async function setInvitePasswordAction(
  prevState: SetInvitePasswordState,
  formData: FormData,
): Promise<SetInvitePasswordState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: await serverErrorMessage("sessionExpired") };
  }

  const cookieStore = await cookies();
  const inviteCookie = cookieStore.get(INVITE_PASSWORD_SETUP_COOKIE);

  if (inviteCookie?.value !== session.user.id) {
    return {
      success: false,
      message: await serverErrorMessage("unauthorized"),
    };
  }

  const validatedFields = setInvitePasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: await serverErrorMessage("checkFormFields"),
    };
  }

  const { newPassword } = validatedFields.data;

  try {
    const usersRepository = new PrismaUsersRepository();
    const useCase = new SetInvitePasswordUseCase(usersRepository);
    const headersList = await headers();

    await useCase.execute({
      userId: session.user.id,
      newPassword,
      ipAddress: extractClientIp(headersList.get("x-forwarded-for")),
      userAgent: headersList.get("user-agent"),
    });

    cookieStore.delete(INVITE_PASSWORD_SETUP_COOKIE);
    revalidatePath(`/user/${session.user.id}`);

    return {
      success: true,
      message: await resolveSuccessMessage("passwordUpdated"),
    };
  } catch (error) {
    return {
      success: false,
      message: await resolveActionErrorMessage(error),
    };
  }
}
