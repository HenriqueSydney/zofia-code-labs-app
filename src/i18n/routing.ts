import { defineRouting } from "next-intl/routing";

export const SUPPORTED_LOCALES = [
  "pt", // Português
  //"en", // Inglês
] as const;
export const DEFAULT_LOCALE = "pt";
export type SupportedLocales = (typeof SUPPORTED_LOCALES)[number];

export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localeDetection: false,
  localePrefix: "as-needed",
  localeCookie: true,
});
