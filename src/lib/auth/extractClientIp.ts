const LOCALHOST_IPS = new Set(["127.0.0.1", "::1", "unknown"]);

export function extractClientIp(
  forwardedFor: string | null,
  fallback = "unknown",
): string {
  if (!forwardedFor) {
    return fallback;
  }

  return forwardedFor.split(",")[0]?.trim() || fallback;
}

export function isLocalhostIp(ipAddress: string): boolean {
  return LOCALHOST_IPS.has(ipAddress);
}
