"use server";

import { z } from "zod";
import { auth } from "@/auth"; // Seu Auth.js
import { PrismaUsersRepository } from "@/repositories/prisma/PrismaUsersRepository";
import { UpdatePasswordUseCase } from "@/useCases/users/UpdatePasswordUseCase";
import { revalidatePath } from "next/cache";

// Schema igual ao do client para garantir consistência
const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
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
    return { success: false, message: "Sessão expirada." };
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
      message: "Verifique os erros no formulário.",
    };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  try {
    // 3. Injeção de Dependências
    const usersRepository = new PrismaUsersRepository();
    const useCase = new UpdatePasswordUseCase(usersRepository);

    // 4. Execução
    await useCase.execute({
      userId: session.user.id,
      currentPassword,
      newPassword,
    });

    // 5. Revalidação (Opcional, pois senha não muda nada visual na tela geralmente)
    revalidatePath("/dashboard/profile");

    return { success: true, message: "Senha atualizada com sucesso!" };
  } catch (error: any) {
    // Tratamento de erros conhecidos
    if (error.message === "Senha atual incorreta.") {
      return {
        success: false,
        errors: { currentPassword: ["A senha atual digitada está incorreta."] }, // Mapeia para o campo
        message: "Erro de validação.",
      };
    }

    console.error("Erro updatePasswordAction:", error);
    return {
      success: false,
      message: error.message || "Erro interno ao atualizar senha.",
    };
  }
}
