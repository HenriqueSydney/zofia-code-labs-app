"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { revalidatePath } from "next/cache";
import { makeDeleteClientEmployeeUseCase } from "@/useCases/clients/factories/makeDeleteClientEmployeeUseCase";
import { auth } from "@/auth";
import { ValidationError } from "@/errors";

export async function deleteClientEmployeeAction(
  employeeId: string,
  clientSlug: string
) {
  try {
    const session = await auth();
    if (!session?.user) throw new ValidationError("unauthorized", { statusCode: 401, severity: "low" });

    const useCase = makeDeleteClientEmployeeUseCase();

    await useCase.execute(session.user.id, employeeId);

    revalidatePath(`/clients/${clientSlug}`);
    return { success: true, message: await resolveSuccessMessage("employeeRemoved") };
  } catch (error) {
    return { success: false, message: await serverErrorMessage("employeeRemoveFailed") };
  }
}
