"use server";

import { revalidatePath } from "next/cache";
import { makeUpdateClientEmployeeUseCase } from "@/useCases/clients/factories/makeUpdateClientEmployeeUseCase";
import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";

export async function updateClientEmployeeAction(
  id: string,
  formData: FormData
) {
  try {
    const session = await auth();
    if (!session?.user) throw new AppError("Não autorizado");

    const data = {
      jobTitle: formData.get("jobTitle") as string,
      permissionRole: formData.get("permissionRole") as any,
    };

    const useCase = makeUpdateClientEmployeeUseCase();

    await useCase.execute({
      authenticatedUserId: session.user.id,
      employeeId: id,
      ...data,
    });

    const clientSlug = formData.get("clientSlug");

    revalidatePath(`/clients/${clientSlug}`);
    return { success: true, message: "Dados atualizados com sucesso!" };
  } catch (error) {
    return { success: false, message: "Falha na atualização." };
  }
}
