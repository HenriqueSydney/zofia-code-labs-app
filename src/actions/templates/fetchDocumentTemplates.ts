"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeFetchDocumentTemplatesUseCase } from "@/useCases/documentTemplates/factories/makeFetchDocumentTemplatesUseCase";


export async function fetchDocumentTemplatesAction(
  query?: string,
  pagination?: { page?: number; numberPerPage?: number }
) {
  const session = await auth();
  if (!session?.user) throw new AppError("Usuário não autenticado");

  const useCase = makeFetchDocumentTemplatesUseCase();

  return await useCase.execute({
    query,
    userId: session.user.id,
    organizationId: session.user.organizationId,
    page: pagination?.page,
    numberPerPage: pagination?.numberPerPage,
  });
}
