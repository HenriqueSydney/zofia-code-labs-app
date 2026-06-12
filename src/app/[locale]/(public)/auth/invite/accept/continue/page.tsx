import { auth, signIn } from "@/auth";
import { ORG_INVITE_COOKIE } from "@/constants/orgInvite";
import { resolveActionErrorMessage } from "@/errors/resolveActionErrorMessage";
import { applyOrgInviteSessionCookies } from "@/lib/auth/applyOrgInviteSessionCookies";
import { parseSignedOrgInviteCookieValue } from "@/lib/auth/orgInviteCookie";
import { makeCompleteOrganizationInviteLoginUseCase } from "@/useCases/organization/factories/makeCompleteOrganizationInviteLoginUseCase";
import { AuthError } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { InviteAcceptError } from "../_components/InviteAcceptError";

export default async function AcceptInviteContinuePage() {
  const t = await getTranslations("auth.inviteAccept");
  const cookieStore = await cookies();
  const inviteCookie = cookieStore.get(ORG_INVITE_COOKIE);
  const payload = inviteCookie?.value
    ? parseSignedOrgInviteCookieValue(inviteCookie.value)
    : null;

  if (!payload) {
    return <InviteAcceptError message={t("invalidToken")} />;
  }

  const session = await auth();
  const targetPath = `/user/${payload.userId}?changePassword=1`;

  if (session?.user?.id && session.user.id !== payload.userId) {
    return <InviteAcceptError message={t("wrongAccount")} />;
  }

  if (session?.user?.id === payload.userId) {
    try {
      await makeCompleteOrganizationInviteLoginUseCase().execute({
        userId: payload.userId,
        inviteToken: payload.token,
      });
      await applyOrgInviteSessionCookies(payload.userId);
      redirect(targetPath);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "digest" in error &&
        String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
      ) {
        throw error;
      }

      return (
        <InviteAcceptError message={await resolveActionErrorMessage(error)} />
      );
    }
  }

  try {
    await signIn("org-invite", {
      userId: payload.userId,
      redirectTo: targetPath,
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    if (error instanceof AuthError) {
      return (
        <InviteAcceptError message={await resolveActionErrorMessage(error)} />
      );
    }

    return (
      <InviteAcceptError message={await resolveActionErrorMessage(error)} />
    );
  }
}
