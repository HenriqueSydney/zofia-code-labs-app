import { normalizeString } from "./normalizeString";

export function normalizeId(text: string) {
  return normalizeString(text)
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");
}
