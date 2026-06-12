"use server";

import { resolveActionErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { ValidationError } from "@/errors";
import { makeListClientEmployeeUseCase } from "@/useCases/clients/factories/makeListClientEmployeeUseCase";

export async function fetchClientEmployeesAction(slug: string) {
  try {
    const session = await auth();
    if (!session?.user) throw new ValidationError("unauthorized", { statusCode: 401, severity: "low" });

    const useCase = makeListClientEmployeeUseCase();
    const employees = await useCase.execute({
      authenticatedUserId: session.user.id,
      slug,
      memberRole: session.user.memberRole,
    });

    return { success: true, employees };
  } catch (error) {
    return {
      success: false,
      employees: [],
      message: await resolveActionErrorMessage(error),
    };
  }
}
