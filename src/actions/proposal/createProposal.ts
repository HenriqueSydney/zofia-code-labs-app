"use server";

import {
  resolveActionErrorMessage,
  resolveSuccessMessage,
  serverErrorMessage,
} from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { Proposal } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import { ProposalCreateReturnWithDetails } from "@/repositories/IProposalRepository";
import { createProposalSchema } from "@/schemas/proposal/createProposalSchema";
import { makeCreateProposalUseCase } from "@/useCases/proposal/factories/makeCreateProposalUseCase";
import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";

export async function createProposalAction(formData: FormData) {
  const session = await auth();
  if (!session?.user)
    return { error: await serverErrorMessage("unauthorized") };

  let itemsParsed = [];
  const itemsRaw = formData.get("items");
  if (itemsRaw && typeof itemsRaw === "string") {
    try {
      itemsParsed = JSON.parse(itemsRaw);
    } catch (e) {
      console.error("Erro ao fazer parse dos itens:", e);
      return { error: await serverErrorMessage("invalidData") };
    }
  }

  const fileRaw = formData.get("document");
  const file =
    fileRaw instanceof File && fileRaw.size > 0 ? fileRaw : undefined;

  const rawData = {
    projectId: formData.get("projectId"),
    document: file,
    items: itemsParsed,
    downPaymentPercentage: Number(formData.get("downPaymentPercentage")),
    validUntil: date(String(formData.get("validUntil"))).toDate(),
    paymentGatewayId: formData.get("paymentGatewayId"),
    paymentMethod: formData.get("paymentMethod"),
  };

  // 2. Validação Zod
  const validation = createProposalSchema.safeParse(rawData);
  if (!validation.success) {
    console.error("Erro de validação:", validation.error.flatten());
    return { error: await serverErrorMessage("checkFormFields") };
  }

  const useCase = makeCreateProposalUseCase();
  let success: ProposalCreateReturnWithDetails;
  try {
    const proposal = await useCase.execute({
      projectId: validation.data.projectId,
      createdBy: session.user.id,
      downPaymentPercentage: validation.data.downPaymentPercentage,
      organizationId: session.user.organizationId,
      validUntil: validation.data.validUntil,
      items: validation.data.items,
      file,
      paymentGatewayId: validation.data.paymentGatewayId,
      paymentMethod: validation.data.paymentMethod ?? "pix",
    });

    success = proposal;
  } catch (error) {
    return { error: await resolveActionErrorMessage(error) };
  }

  if (success) {
    revalidatePath(
      `/clients/${success.project.client.slug}/projects/${success.project.slug}`,
    );
    revalidatePath(
      `/clients/${success.project.client.slug}/projects/${success.project.slug}/commercial/proposals`,
    );
    redirect(
      `/clients/${success.project.client.slug}/projects/${success.project.slug}/commercial/proposals?success=true`,
      RedirectType.push,
    );
  }
}
