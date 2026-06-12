"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";

import {
  UpdateMemberSpecificPermissionsSchema,
  updateMemberSpecificPermissionsSchema,
} from "@/schemas/organization/updateMemberSpecificPermissionsSchema";
import { makeUpdateOrganizationMemberSpecificPermissionsUseCase } from "@/useCases/organization/factories/makeUpdateOrganizationMemberSpecificPermissionsUseCase";
import { revalidatePath } from "next/cache";

export async function updateMemberSpecificPermissionsAction(
  data: UpdateMemberSpecificPermissionsSchema,
) {
  const session = await auth();

  if (!session) {
    return { success: false, error: await serverErrorMessage("notLoggedIn") };
  }

  const validation = updateMemberSpecificPermissionsSchema.safeParse(data);
  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  try {
    const useCase = makeUpdateOrganizationMemberSpecificPermissionsUseCase();

    const { member } = await useCase.execute({
      memberId: data.memberId,
      organizationId: session.user.organizationId,
      permissions: data.permissions,
      userId: session.user.id,
    });

    revalidatePath(`/organization/${session.user.organizationId}/members`);
    return { success: true, data: member };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, error: message };
  }
}
