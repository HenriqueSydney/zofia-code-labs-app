"use server";

import {
  resolveActionErrorMessage,
  resolveSuccessMessage,
  serverErrorMessage,
} from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError } from "@/errors";
import { makeTestIntegrationConnectionUseCase } from "@/useCases/integration/factories/makeTestIntegrationConnectionUseCase";
import { revalidatePath } from "next/cache";

export async function testIntegrationConnectionAction(integrationId: string) {
  // 1. Autenticação e extração do ID da organização
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    throw new UnauthorizedError("sessionExpiredNoOrg", {
      i18nKey: "sessionExpiredNoOrg",
    });
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

    if (result.status === "ERROR") {
      return {
        success: false,
        message: result.message,
      };
    }

    revalidatePath("/settings/integrations/config/");
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    await resolveActionErrorMessage(error);
    throw error;
  }
}
