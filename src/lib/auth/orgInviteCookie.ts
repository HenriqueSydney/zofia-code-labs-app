import { createHmac, timingSafeEqual } from "node:crypto";

import { envVariables } from "@/env";

export type OrgInviteCookiePayload = {
  userId: string;
  token: string;
};

function getSigningSecret(): string {
  return envVariables.AUTH_SECRET;
}

function signPayload(encodedPayload: string): string {
  return createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createSignedOrgInviteCookieValue(
  payload: OrgInviteCookiePayload,
): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function parseSignedOrgInviteCookieValue(
  value: string,
): OrgInviteCookiePayload | null {
  const separatorIndex = value.lastIndexOf(".");

  if (separatorIndex <= 0) {
    return null;
  }

  const encodedPayload = value.slice(0, separatorIndex);
  const receivedSignature = value.slice(separatorIndex + 1);
  const expectedSignature = signPayload(encodedPayload);

  const receivedBuffer = Buffer.from(receivedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as OrgInviteCookiePayload;

    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.token !== "string" ||
      !parsed.userId ||
      !parsed.token
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export const ORG_INVITE_COOKIE_MAX_AGE_SECONDS = 60 * 60;

export function getOrgInviteCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: ORG_INVITE_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  };
}

export function getInvitePasswordSetupCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: ORG_INVITE_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  };
}
