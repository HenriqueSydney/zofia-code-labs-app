import { envVariables } from "@/env";
import { prisma } from "@/lib/prisma";
import { fetchInfisicalSecretValues } from "@/lib/integration/fetchInfisicalSecretValues";
import { IntegrationType } from "@/services/IntegrationFactory";
import { makeSecretManagementService } from "@/services/secretManagement/makeSecretManagementService";

export async function fetchStripeWebhookSecretForOrganization(
  organizationId: string,
): Promise<string> {
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

export async function collectStripeWebhookSecretCandidates(
  organizationId?: string,
): Promise<string[]> {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const add = (secret: string | undefined) => {
    if (secret && !seen.has(secret)) {
      seen.add(secret);
      candidates.push(secret);
    }
  };

  add(envVariables.STRIPE_WEBHOOK_SECRET);

  if (organizationId) {
    try {
      add(await fetchStripeWebhookSecretForOrganization(organizationId));
    } catch {
      // segue para candidatos de fallback
    }
  }

  const integrations = await prisma.organizationIntegration.findMany({
    where: {
      enabled: true,
      integrationType: { slug: IntegrationType.STRIPE },
      ...(organizationId ? { organizationId: { not: organizationId } } : {}),
    },
    include: {
      integrationType: true,
    },
  });

  for (const integration of integrations) {
    try {
      add(
        await fetchStripeWebhookSecretForOrganization(integration.organizationId),
      );
    } catch {
      // ignora organizações sem secret configurado
    }
  }

  return candidates;
}

export async function resolveStripeWebhookSecret(
  organizationId?: string,
): Promise<string> {
  if (envVariables.STRIPE_WEBHOOK_SECRET) {
    return envVariables.STRIPE_WEBHOOK_SECRET;
  }

  if (organizationId) {
    return fetchStripeWebhookSecretForOrganization(organizationId);
  }

  const candidates = await collectStripeWebhookSecretCandidates();
  if (candidates.length === 1) {
    return candidates[0];
  }

  throw new Error(
    "STRIPE_WEBHOOK_SECRET não configurado e organizationId ausente no evento.",
  );
}
