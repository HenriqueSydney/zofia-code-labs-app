import { envVariables } from "@/env";
import { prisma } from "@/lib/prisma";
import { fetchInfisicalSecretValues } from "@/lib/integration/fetchInfisicalSecretValues";
import { IntegrationType } from "@/services/IntegrationFactory";
import { makeSecretManagementService } from "@/services/secretManagement/makeSecretManagementService";

export async function resolveStripeWebhookSecret(
  organizationId?: string,
): Promise<string> {
  if (envVariables.STRIPE_WEBHOOK_SECRET) {
    return envVariables.STRIPE_WEBHOOK_SECRET;
  }

  if (!organizationId) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET não configurado e organizationId ausente no evento.",
    );
  }

  const integration = await prisma.organizationIntegration.findFirst({
    where: {
      organizationId,
      enabled: true,
      integrationType: { slug: IntegrationType.STRIPE },
    },
    include: {
      integrationType: true,
    },
  });

  if (!integration) {
    throw new Error(
      `Integração Stripe não encontrada para a organização ${organizationId}.`,
    );
  }

  const config = integration.config as {
    infisical?: { path?: string; keys?: string[] };
  };

  const secrets = await fetchInfisicalSecretValues({
    secretManagementService: makeSecretManagementService(),
    path: config.infisical?.path,
    keys: config.infisical?.keys ?? ["STRIPE_WEBHOOK_SECRET"],
    fieldsSchema:
      (integration.integrationType.fieldsSchema as Record<string, unknown>[]) ??
      [],
  });

  const webhookSecret = secrets.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error(
      `STRIPE_WEBHOOK_SECRET não encontrado no Infisical para a organização ${organizationId}.`,
    );
  }

  return webhookSecret;
}
