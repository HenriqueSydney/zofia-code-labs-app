"use server";

import { z } from "zod";
import { auth } from "@/auth"; // Seu Auth.js v5
import { PrismaUsersRepository } from "@/repositories/prisma/PrismaUsersRepository";
import { UpdateAvatarUseCase } from "@/useCases/users/UpdateAvatarUseCase";
import { revalidatePath } from "next/cache";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";

// Schema de Validação
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const uploadAvatarSchema = z.object({
  file: z
    .instanceof(File, { message: "A imagem é obrigatória" })
    .refine((file) => file.size <= MAX_FILE_SIZE, `O tamanho máximo é 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Apenas formatos .jpg, .jpeg, .png e .webp são suportados."
    ),
});

export type UpdateAvatarState = {
  success: boolean;
  message?: string;
  errors?: {
    file?: string[];
  };
};

export async function updateAvatarAction(
  prevState: UpdateAvatarState,
  formData: FormData
): Promise<UpdateAvatarState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: "Não autorizado." };
  }

  // 1. Parse e Validação do Zod
  const validatedFields = uploadAvatarSchema.safeParse({
    file: formData.get("file"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Erro na validação do arquivo.",
    };
  }

  try {
    // 2. Instanciação das dependências (Injection)
    const usersRepository = new PrismaUsersRepository();
    const storageService = makeS3StorageService();
    const useCase = new UpdateAvatarUseCase(usersRepository, storageService);

    // 3. Execução
    await useCase.execute({
      userId: session.user.id,
      file: validatedFields.data.file,
    });

    revalidatePath("/dashboard"); // Atualiza a UI onde a foto aparece

    return { success: true, message: "Avatar atualizado com sucesso!" };
  } catch (error) {
    console.error("Erro ao atualizar avatar:", error);
    return { success: false, message: "Erro interno ao salvar avatar." };
  }
}
