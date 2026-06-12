"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError, IntegrationError, ExternalServiceError } from "@/errors";
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
      throw new UnauthorizedError("unauthorized");
    }

    const projectIntegrationRepository = makeProjectIntegrationRepository();

    const projectIntegration =
      await projectIntegrationRepository.findByProjectAndSlug(
        projectSlug,
        IntegrationType.UMAMI
      );

    if (!projectIntegration) {
      throw new IntegrationError("umamiIntegrationNotFound");
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
      throw new ExternalServiceError("umamiWebsiteIdMissing");
    }

    const result = await service.getRealtimeMetrics(websiteId);

    return {
      success: true,
      data: result,
      message: await resolveSuccessMessage("dataFetched"),
    };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, message };
  }
}
