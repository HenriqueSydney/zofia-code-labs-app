export const ORG_INVITE_IDENTIFIER_PREFIX = "org-invite:";
export const ORG_INVITE_COOKIE = "org_invite";
export const INVITE_PASSWORD_SETUP_COOKIE = "invite_password_setup";

/** Query params sensíveis removidos de URLs em redirects e callbacks. */
export const SENSITIVE_QUERY_PARAMS = ["token"] as const;
