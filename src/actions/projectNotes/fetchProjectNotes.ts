"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeFetchProjectNotesUseCase } from "@/useCases/projectNotes/factories/makeFetchProjectNotesUseCase";

export async function fetchProjectNotes(
  projectId: string,
  query?: string,
  pagination?: { page?: number; numberPerPage?: number }
) {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError(await serverErrorMessage("unauthenticated"));

  const useCase = makeFetchProjectNotesUseCase();

  return await useCase.execute({
    projectId,
    userId: session.user.id,
    query,
    page: pagination?.page,
    numberPerPage: pagination?.numberPerPage,
  });
}
