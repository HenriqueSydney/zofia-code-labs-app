"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeFetchProjectNotesUseCase } from "@/useCases/projectNotes/factories/makeFetchProjectNotesUseCase";

export async function fetchProjectNotes(
  projectId: string,
  query?: string,
  pagination?: { page?: number; numberPerPage?: number }
) {
  const session = await auth();
  if (!session?.user) throw new AppError("Usuário não autenticado");

  const useCase = makeFetchProjectNotesUseCase();

  return await useCase.execute({
    projectId,
    userId: session.user.id,
    query,
    page: pagination?.page,
    numberPerPage: pagination?.numberPerPage,
  });
}
