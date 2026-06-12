"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import {
  updateMemberRoleSchema,
  UpdateMemberRoleSchema,
} from "@/schemas/organization/updateMemberRoleSchema";
import { makeUpdateOrganizationUserRoleUseCase } from "@/useCases/organization/factories/makeUpdateOrganizationUserRoleUseCase";
import { revalidatePath } from "next/cache";

export async function updateMemberRoleAction(data: UpdateMemberRoleSchema) {
  const session = await auth();

  if (!session) {
    return { success: false, error: await serverErrorMessage("notLoggedIn") };
  }

  const validation = updateMemberRoleSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  try {
    const useCase = makeUpdateOrganizationUserRoleUseCase();

    const { role } = await useCase.execute({
      memberId: data.memberId,
      organizationId: session.user.organizationId,
      roleId: data.customRoleId,
      userId: session.user.id,
    });

    revalidatePath(`/organization/${session.user.organizationId}/members`)
    return { success: true, data: role };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, error: message };
  }
}
