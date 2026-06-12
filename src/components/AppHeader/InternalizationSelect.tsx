"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { SUPPORTED_LOCALES, SupportedLocales } from "../../i18n/routing";
import { localeMap } from "../../utils/dateFormatter";

export function InternalizationSelect() {
  const t = useTranslations("languages");
  const locale = useLocale() as SupportedLocales;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isSmallDevice, setIsSmallDevice] = useState(false);

  const handleChangeLocale = (newLocale: SupportedLocales) => {
    if (newLocale === locale) return;

    const queryString = searchParams.toString();
    const href = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(href, { locale: newLocale });
    router.refresh();
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallDevice(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const getDisplayLabel = (value: SupportedLocales) => {
    const fullLabel = t(value);
    if (isSmallDevice) {
      return localeMap[value] ?? value;
    }
    return fullLabel;
  };

  return (
    <Select
      value={locale}
      onValueChange={(value: SupportedLocales) => handleChangeLocale(value)}
    >
      <SelectTrigger
        className="w-[140px] sm:w-[140px] w-[120px] h-9 rounded-md glass-effect hover:bg-accent cursor-pointer transition-colors"
        aria-label="Select the desired language"
      >
        <SelectValue>{getDisplayLabel(locale)}</SelectValue>
      </SelectTrigger>
      <SelectContent className="glass-effect-strong border-border/40 ">
        {SUPPORTED_LOCALES.map((item) => (
          <SelectItem key={item} value={item} className="cursor-pointer">
            {t(item)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
