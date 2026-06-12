"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { Contract } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import { ContractWithProjectDetails } from "@/repositories/IContractRepository";
import { createContractSchema } from "@/schemas/contract/createContractSchema";
import { makeCreateContractUseCase } from "@/useCases/contract/factories/makeCreateContractUseCase";
import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";

export async function createContractAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: await serverErrorMessage("unauthorized") };

  const fileRaw = formData.get("document");
  const file =
    fileRaw instanceof File && fileRaw.size > 0 ? fileRaw : undefined;

  const rawData = {
    projectId: formData.get("projectId"),
    document: file,
    validUntil: date().add(3, "days").toDate(), //formData.get("validUntil"),
  };

  // 2. Validação Zod
  const validation = createContractSchema.safeParse(rawData);
  if (!validation.success) {
    console.error("Erro de validação:", validation.error.flatten());
    return { error: await serverErrorMessage("checkFormFields") };
  }

  const useCase = makeCreateContractUseCase();
  let success: ContractWithProjectDetails;
  try {
    const contract = await useCase.execute({
      projectId: validation.data.projectId,
      createdBy: session.user.id,
      organizationId: session.user.organizationId,
      file,
    });

    success = contract;
  } catch (error) {
    return { error: "Erro ao criar o contrato." };
  }

  if (success) {
    revalidatePath(
      `/clients/${success.project.client.slug}/projects/${success.project.slug}`,
    );
    revalidatePath(
      `/clients/${success.project.client.slug}/projects/${success.project.slug}/commercial/contracts`,
    );
    redirect(
      `/clients/${success.project.client.slug}/projects/${success.project.slug}/commercial/contracts?success=true`,
      RedirectType.push,
    );
  }
}
