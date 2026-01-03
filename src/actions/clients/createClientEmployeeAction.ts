"use server";

import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { handleErrors } from "@/errors/handleErrors";
import { employeeSchema } from "@/schemas/clients/employeeSchema";
import { makeCreateClientEmployeeUseCase } from "@/useCases/clients/factories/makeCreateClientEmployeeUseCase";
import { revalidatePath } from "next/cache";

export async function createClientEmployeeAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) throw new AppError("Não autorizado");

    const rawData = {
      email: formData.get("email") as string,
      name: formData.get("name") as string,
      jobTitle: formData.get("jobTitle") as string,
      permissionRole: formData.get("permissionRole") as string,
    };

    const clientSlug = formData.get("clientSlug") as string;
    const validatedData = employeeSchema.parse(rawData);
    const useCase = makeCreateClientEmployeeUseCase();

    await useCase.execute({
      clientSlug,
      authenticatedUserId: session.user.id, // Obter via auth() ou similar
      ...validatedData,
    });

    revalidatePath(`/clients/${clientSlug}`);
    return { success: true, message: "Funcionário convidado com sucesso!" };
  } catch (error) {
    handleErrors(error);
    return { success: false, message: "Erro ao cadastrar funcionário." };
  }
}
