"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { v } from "@/schemas/validationMessages";
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
    .instanceof(File, { message: v.imageRequired })
    .refine((file) => file.size <= MAX_FILE_SIZE, v.fileMaxSize)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      v.invalidFileFormat,
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
  formData: FormData,
): Promise<UpdateAvatarState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: await serverErrorMessage("unauthorized") };
  }

  // 1. Parse e Validação do Zod
  const validatedFields = uploadAvatarSchema.safeParse({
    file: formData.get("file"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: await serverErrorMessage("fileValidationFailed"),
    };
  }

  try {
    // 2. Instanciação das dependências (Injection)
    const usersRepository = new PrismaUsersRepository();
    const storageService = makeS3StorageService();
    const useCase = new UpdateAvatarUseCase(usersRepository, storageService);

    await useCase.execute({
      userId: session.user.id,
      file: validatedFields.data.file,
    });

    revalidatePath("/"); // Atualiza a UI onde a foto aparece

    return { success: true, message: await resolveSuccessMessage("avatarUpdated") };
  } catch (error) {
    console.error("Erro ao atualizar avatar:", error);
    return { success: false, message: await serverErrorMessage("avatarSaveFailed") };
  }
}
