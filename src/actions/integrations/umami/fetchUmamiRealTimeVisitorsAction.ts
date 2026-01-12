"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { makeProjectIntegrationRepository } from "@/repositories/factories/makeProjectIntegrationRepository";
import {
  IntegrationFactory,
  IntegrationType,
} from "@/services/IntegrationFactory";
import { UmamiWebAnalyticsService } from "@/services/webAnalytics/UmamiWebAnalyticsService";

export async function fetchUmamiRealTimeVisitorsAction(projectSlug: string) {
  const session = await auth();

  try {
    // Aqui você verificaria se o usuário é o ADMIN do sistema
    if (!session?.user) {
      throw new AppError("Não autorizado.");
    }

    const projectIntegrationRepository = makeProjectIntegrationRepository();

    const projectIntegration =
      await projectIntegrationRepository.findByProjectAndSlug(
        projectSlug,
        IntegrationType.UMAMI
      );

    if (!projectIntegration) {
      throw new Error(`Integração do Projeto com o Umami não encontrada.`);
    }

    const integrationFactory = new IntegrationFactory();

    // 2. Instancia o serviço através da Factory
    const service =
      await integrationFactory.getIntegration<UmamiWebAnalyticsService>({
        organizationId:
          projectIntegration.organizationIntegration.organizationId,
        type: IntegrationType.UMAMI,
      });

    const websiteId = "f4d85941-32ee-40f6-a0c0-80a788a6de7e"; //(projectIntegration.config as any)?.externalId;
    if (!websiteId) {
      throw new Error("ID do website não configurado na integração do Umami.");
    }

    const result = await service.getRealtimeMetrics(websiteId);

    return {
      success: true,
      data: result,
      message: "Dados retornados com sucesso",
    };
  } catch (error) {
    const message = handleErrors(error);
    return { success: false, message };
  }
}
