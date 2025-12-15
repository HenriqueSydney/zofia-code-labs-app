import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing, SupportedLocales } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  let locale = (await requestLocale) as SupportedLocales;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
