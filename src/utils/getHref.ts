import { SupportedLocales } from "@/i18n/routing";

export function getHref(
  locale: SupportedLocales,
  pathname: string,
  href: string
) {
  const isHomePage = pathname === "/" || pathname === `/${locale}`;

  let destinationLink = `/${locale}/`;
  if (!isHomePage) {
    destinationLink = "";
  }
  if (isHomePage) {
    return href;
  }

  return `/${locale}${href}`;
}
