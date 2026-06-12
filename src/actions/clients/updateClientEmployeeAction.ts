"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { revalidatePath } from "next/cache";
import { makeUpdateClientEmployeeUseCase } from "@/useCases/clients/factories/makeUpdateClientEmployeeUseCase";
import { auth } from "@/auth";
import { ValidationError } from "@/errors";

export async function updateClientEmployeeAction(
  id: string,
  formData: FormData
) {
  try {
    const session = await auth();
    if (!session?.user) throw new ValidationError("unauthorized", { statusCode: 401, severity: "low" });

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
    return { success: true, message: await resolveSuccessMessage("dataUpdated") };
  } catch (error) {
    return { success: false, message: await serverErrorMessage("updateFailed") };
  }
}
