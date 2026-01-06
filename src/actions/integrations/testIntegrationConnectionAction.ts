"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { makeTestIntegrationConnectionUseCase } from "@/useCases/integration/factories/makeTestIntegrationConnectionUseCase";
import { revalidatePath } from "next/cache";

export async function testIntegrationConnectionAction(integrationId: string) {
  // 1. Autenticação e extração do ID da organização
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new AppError("Sessão expirada ou organização não encontrada.");
  }

  try {
    // 2. Instanciação do Use Case via Factory
    const useCase = makeTestIntegrationConnectionUseCase();

    // 3. Execução da lógica de negócio
    const result = await useCase.execute({
      organizationId,
      userId: session.user.id,
      integrationId,
    });

    
    revalidatePath("/settings/integrations/config/");
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    handleErrors(error);
    throw error;
  }
}
