"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { makeGetUserAllInfoUseCase } from "@/useCases/users/factories/makeGetUserAllInfoUseCase";

/**
 * Busca todas as informações do perfil do usuário logado (incluindo dados sensíveis e imagem assinada).
 * @param userId - Opcional. Se não passado, usa o ID da sessão atual.
 */
export async function getUserInfoAction(userId?: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Usuário não autenticado.",
      data: null,
    };
  }

  // O ID do alvo deve ser o ID passado OU o ID da sessão
  const targetId = userId || session.user.id;

  try {
    const useCase = makeGetUserAllInfoUseCase();

    // Executa o caso de uso passando o ID da sessão como "authenticatedUserId"
    // para satisfazer a regra de segurança do Use Case.
    const { user } = await useCase.execute({
      targetUserId: targetId,
      authenticatedUserId: session.user.id,
    });

    // Serialização: O Next.js Server Actions lida bem com Dates,
    // mas se tiver problemas com decimais ou BigInts, converta aqui.
    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }

    console.error("Erro ao buscar informações do usuário:", error);
    return {
      success: false,
      message: "Ocorreu um erro inesperado ao carregar o perfil.",
      data: null,
    };
  }
}
