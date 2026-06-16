"use server";

import { resolveActionErrorMessage, resolveSuccessMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { ValidationError } from "@/errors";
import { employeeSchema } from "@/schemas/clients/employeeSchema";
import { makeCreateClientEmployeeUseCase } from "@/useCases/clients/factories/makeCreateClientEmployeeUseCase";
import { revalidatePath } from "next/cache";

export async function createClientEmployeeAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) throw new ValidationError("unauthorized", { statusCode: 401, severity: "low" });

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
    return { success: true, message: await resolveSuccessMessage("employeeInvited") };
  } catch (error) {
    return {
      success: false,
      message: await resolveActionErrorMessage(error),
    };
  }
}
