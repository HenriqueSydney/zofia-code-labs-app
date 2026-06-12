"use server";

import {
  resolveActionErrorMessage,
  resolveSuccessMessage,
  serverErrorMessage,
} from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { inviteMemberSchema } from "@/schemas/organization/inviteMemberSchema";
import { makeInviteOrganizationMemberUseCase } from "@/useCases/organization/factories/makeInviteOrganizationMemberUseCase";
import { revalidatePath } from "next/cache";

export async function inviteOrganizationMemberAction(data: unknown) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, message: await serverErrorMessage("unauthorized") };
  }

  const parsed = inviteMemberSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: await serverErrorMessage("invalidData"),
    };
  }

  if (parsed.data.organizationId !== session.user.organizationId) {
    return { success: false, message: await serverErrorMessage("accessDenied") };
  }

  try {
    await makeInviteOrganizationMemberUseCase().execute({
      inviterUserId: session.user.id,
      organizationId: parsed.data.organizationId,
      name: parsed.data.name,
      email: parsed.data.email,
      roleId: parsed.data.roleId,
    });

    revalidatePath(`/organization/${parsed.data.organizationId}/members`);

    return {
      success: true,
      message: await resolveSuccessMessage("organizationMemberInvited"),
    };
  } catch (error) {
    return {
      success: false,
      message: await resolveActionErrorMessage(error),
    };
  }
}
