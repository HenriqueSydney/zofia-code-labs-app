"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  useSearchParams,
  useRouter,
  useParams,
  usePathname,
} from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { SUPPORTED_LOCALES, SupportedLocales } from "../../i18n/routing";
import { localeMap } from "../../utils/dateFormatter";

export function InternalizationSelect() {
  const t = useTranslations("languages");
  const [currentLocale, setCurrentLocale] = useState<SupportedLocales>("pt");
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale: SupportedLocales = (params?.locale as SupportedLocales) ?? "pt";

  const handleChangeLocale = (newLocale: SupportedLocales) => {
    if (newLocale !== locale) {
      const queryString = searchParams.toString();

      const newPath = pathname.replace(`/${locale}/`, `/${newLocale}/`);
      const fullUrl = queryString ? `${newPath}?${queryString}` : newPath;

      router.push(fullUrl, { scroll: false });
      router.refresh();
    }
  };

  useEffect(() => {
    if (SUPPORTED_LOCALES.includes(locale as any)) {
      setCurrentLocale(locale as SupportedLocales);
    }
  }, [locale]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallDevice(window.innerWidth < 640); // 640px é o breakpoint 'sm' do Tailwind
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const getDisplayLabel = (locale: SupportedLocales) => {
    const fullLabel = t(locale);
    if (isSmallDevice) {
      const resolvedLocale = localeMap[locale] ?? locale;
      return resolvedLocale;
    }
    return fullLabel;
  };
  return (
    <Select
      value={currentLocale}
      onValueChange={(locale: SupportedLocales) => handleChangeLocale(locale)}
    >
      <SelectTrigger
        className="w-[140px] sm:w-[140px] w-[120px] rounded-full glass-effect border-border/40 hover:bg-accent cursor-pointer transition-colors"
        aria-label="Select the desired language"
      >
        <SelectValue>{getDisplayLabel(currentLocale)}</SelectValue>
      </SelectTrigger>
      <SelectContent className="glass-effect-strong border-border/40 ">
        {SUPPORTED_LOCALES.map((locale) => (
          <SelectItem key={locale} value={locale} className="cursor-pointer">
            {t(locale)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
