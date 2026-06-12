"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { UnauthorizedError, IntegrationError } from "@/errors";
import { makeOrganizationIntegrationRepository } from "@/repositories/factories/makeOrganizationIntegrationRepository";
import { IGitService } from "@/services/git/IGitService";
import {
  IntegrationFactory,
  IntegrationType,
} from "@/services/IntegrationFactory";

export async function fetchGitHubRepositoriesAction() {
  const session = await auth();

  try {
    // Aqui você verificaria se o usuário é o ADMIN do sistema
    if (!session?.user) {
      throw new UnauthorizedError("unauthorized");
    }

    const organizationIntegrationRepository =
      makeOrganizationIntegrationRepository();

    const organizationIntegration =
      await organizationIntegrationRepository.findByOrgAndSlug(
        session.user.organizationId,
        IntegrationType.GITHUB
      );

    if (!organizationIntegration) {
      throw new IntegrationError("umamiIntegrationNotFound");
    }

    const integrationFactory = new IntegrationFactory();

    // 2. Instancia o serviço através da Factory
    const secrets = await integrationFactory.getServiceSecret(
      session.user.organizationId,
      IntegrationType.GITHUB
    );

    const service = await integrationFactory.getIntegration<IGitService>({
      organizationId: session.user.organizationId,
      type: IntegrationType.GITHUB,
      providedSecrets: secrets,
    });

    const result = await service.listRepositories(secrets["GITHUB_ORG_NAME"]);

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
