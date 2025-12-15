"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export type NavItem = {
  href: string;
  label: string;
  type: "anchor" | "link";
};

export function useNavLinks(): NavItem[] {
  const pathName = usePathname();
  const t = useTranslations("navLinks");

  const navItemType = pathName === "/" ? "anchor" : "link";

  return [
    { href: "#about", label: t("about"), type: navItemType },
    { href: "blog", label: t("blog"), type: "link" },
    { href: "#projects", label: t("projects"), type: navItemType },
    { href: "#certifications", label: t("certifications"), type: navItemType },
    { href: "#skills", label: t("skills"), type: navItemType },
    { href: "#experience", label: t("experience"), type: navItemType },
    { href: "#contact", label: t("contact"), type: navItemType },
  ];
}
