import { ORG_INVITE_COOKIE } from "@/constants/orgInvite";
import { resolveActionErrorMessage } from "@/errors/resolveActionErrorMessage";
import { applyOrgInviteSessionCookies } from "@/lib/auth/applyOrgInviteSessionCookies";
import {
  createSignedOrgInviteCookieValue,
  getOrgInviteCookieOptions,
} from "@/lib/auth/orgInviteCookie";
import { makeAcceptOrganizationInviteUseCase } from "@/useCases/organization/factories/makeAcceptOrganizationInviteUseCase";
import { makeCompleteOrganizationInviteLoginUseCase } from "@/useCases/organization/factories/makeCompleteOrganizationInviteLoginUseCase";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { InviteAcceptError } from "./_components/InviteAcceptError";

interface AcceptInvitePageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({
  searchParams,
}: AcceptInvitePageProps) {
  const { token } = await searchParams;
  const t = await getTranslations("auth.inviteAccept");

  if (!token?.trim()) {
    return <InviteAcceptError message={t("invalidToken")} />;
  }

  try {
    const result = await makeAcceptOrganizationInviteUseCase().execute({
      token,
    });

    const cookieStore = await cookies();

    cookieStore.set(
      ORG_INVITE_COOKIE,
      createSignedOrgInviteCookieValue({
        userId: result.userId,
        token: result.token,
      }),
      getOrgInviteCookieOptions(),
    );

    const session = await auth();

    if (session?.user?.id && session.user.id !== result.userId) {
      cookieStore.delete(ORG_INVITE_COOKIE);
      return <InviteAcceptError message={t("wrongAccount")} />;
    }

    if (session?.user?.id === result.userId) {
      await makeCompleteOrganizationInviteLoginUseCase().execute({
        userId: result.userId,
        inviteToken: result.token,
      });
      await applyOrgInviteSessionCookies(result.userId);

      redirect(`/user/${result.userId}?changePassword=1`);
    }

    redirect("/auth/invite/accept/continue");
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
      <InviteAcceptError
        message={await resolveActionErrorMessage(error)}
      />
    );
  }
}
