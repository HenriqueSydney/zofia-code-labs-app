"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { v } from "@/schemas/validationMessages";
import { z } from "zod";
import { auth } from "@/auth";
import { extractClientIp } from "@/lib/auth/extractClientIp";
import { PrismaUsersRepository } from "@/repositories/prisma/PrismaUsersRepository";
import { UpdatePasswordUseCase } from "@/useCases/users/UpdatePasswordUseCase";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// Schema igual ao do client para garantir consistência
const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: v.passwordsMismatch,
    path: ["confirmPassword"],
  });

export type UpdatePasswordState = {
  success: boolean;
  message?: string;
  errors?: {
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
  };
};

export async function updatePasswordAction(
  prevState: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  // 1. Autenticação
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: await serverErrorMessage("sessionExpired") };
  }

  // 2. Validação Zod
  const validatedFields = updatePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
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

  const { currentPassword, newPassword } = validatedFields.data;

  try {
    // 3. Injeção de Dependências
    const usersRepository = new PrismaUsersRepository();
    const useCase = new UpdatePasswordUseCase(usersRepository);

    const headersList = await headers();

    await useCase.execute({
      userId: session.user.id,
      currentPassword,
      newPassword,
      ipAddress: extractClientIp(headersList.get("x-forwarded-for")),
      userAgent: headersList.get("user-agent"),
    });

    // 5. Revalidação (Opcional, pois senha não muda nada visual na tela geralmente)
    revalidatePath("/dashboard/profile");

    return { success: true, message: await resolveSuccessMessage("passwordUpdated") };
  } catch (error: any) {
    // Tratamento de erros conhecidos
    if (error.message === "wrongCurrentPassword" || error.message === "Senha atual incorreta.") {
      return {
        success: false,
        errors: {
          currentPassword: [await serverErrorMessage("wrongCurrentPassword")],
        },
        message: await serverErrorMessage("invalidData"),
      };
    }

    return {
      success: false,
      message: await resolveActionErrorMessage(error),
    };
  }
}
