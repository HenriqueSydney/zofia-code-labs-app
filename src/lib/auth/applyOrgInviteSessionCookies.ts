import {
  INVITE_PASSWORD_SETUP_COOKIE,
  ORG_INVITE_COOKIE,
} from "@/constants/orgInvite";
import {
  getInvitePasswordSetupCookieOptions,
} from "@/lib/auth/orgInviteCookie";
import { cookies } from "next/headers";

export async function applyOrgInviteSessionCookies(userId: string) {
  const cookieStore = await cookies();

  cookieStore.delete(ORG_INVITE_COOKIE);
  cookieStore.set(
    INVITE_PASSWORD_SETUP_COOKIE,
    userId,
    getInvitePasswordSetupCookieOptions(),
  );
}
