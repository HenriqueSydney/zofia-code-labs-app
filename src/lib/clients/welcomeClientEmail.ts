import { randomBytes } from "crypto";

import { Client, ProjectStatus } from "@/generated/prisma/client";
import { PROJECT_STATUS_FLOW } from "@/domain/project/ProjectWorkflow";
import { sendWelcomeClientEmail } from "@/email/send/sendWelcomeClientEmail";
import { date } from "@/lib/dayjs";
import { apiLogger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

import { resolveClientContactEmail } from "@/lib/clients/resolveClientContactEmail";

export type WelcomeClientEmailClient = Pick<
  Client,
  "id" | "email" | "responsibleEmail" | "tradeName" | "companyName"
>;

function resolveAppBaseUrl(): string {
  return (
    process.env.BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

async function buildWelcomeActionUrl(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expires = date().add(24, "hour").toDate();

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  const baseUrl = resolveAppBaseUrl();
  return `${baseUrl}/auth/login?callbackUrl=${encodeURIComponent("/minhas-empresas")}`;
}

export async function isClientFirstProject(clientId: string): Promise<boolean> {
  const projectCount = await prisma.project.count({
    where: { clientId },
  });

  return projectCount === 1;
}

const CONTRACT_SIGNING_PHASE_STATUSES: ProjectStatus[] = PROJECT_STATUS_FLOW.slice(
  PROJECT_STATUS_FLOW.indexOf("WAITING_SIGNATURE"),
);

export async function isClientFirstProjectReachingContractSigning(
  clientId: string,
  currentProjectId: string,
): Promise<boolean> {
  const otherProjectsInSigningPhase = await prisma.project.count({
    where: {
      clientId,
      id: { not: currentProjectId },
      status: { in: CONTRACT_SIGNING_PHASE_STATUSES },
    },
  });

  return otherProjectsInSigningPhase === 0;
}

export async function maybeSendWelcomeClientEmail({
  client,
  projectId,
  projectName,
  source,
}: {
  client: WelcomeClientEmailClient;
  projectId: string;
  projectName: string;
  source: "contract_signed_no_down_payment" | "first_down_payment_paid";
}): Promise<void> {
  const isFirstProject = await isClientFirstProject(client.id);

  if (!isFirstProject) {
    return;
  }

  const contactEmail = resolveClientContactEmail(client);

  if (!contactEmail) {
    return;
  }

  try {
    const actionUrl = await buildWelcomeActionUrl(contactEmail);

    await sendWelcomeClientEmail({
      to: contactEmail,
      clientName: client.tradeName || client.companyName,
      projectName,
      userEmail: contactEmail,
      actionUrl,
    });

    apiLogger.info(
      { clientId: client.id, projectId, source },
      "WelcomeClientEmail enviado",
    );
  } catch (error) {
    apiLogger.error(
      { err: error, clientId: client.id, projectId, source },
      "Falha ao enviar WelcomeClientEmail",
    );
  }
}
