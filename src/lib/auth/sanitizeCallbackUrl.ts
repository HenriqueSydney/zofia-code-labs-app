import { SENSITIVE_QUERY_PARAMS } from "@/constants/orgInvite";

export function sanitizeCallbackUrl(pathname: string, search = ""): string {
  if (!search) {
    return pathname;
  }

  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );

  for (const param of SENSITIVE_QUERY_PARAMS) {
    params.delete(param);
  }

  const queryString = params.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}
