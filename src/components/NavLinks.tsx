"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { useNavLinks } from "@/hooks/use-nav-links";
import { useVisibleAnchor } from "@/hooks/use-visible-anchor";
import { cn } from "@/utils/twMerge";

interface NavLinksProps {
  variant?: "desktop" | "mobile" | "footer" | "notFoundPage";
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export function NavLinks({
  variant = "desktop",
  setIsMobileMenuOpen,
}: NavLinksProps) {
  const pathName = usePathname();

  const navItems = useNavLinks();

  const anchorIds = navItems.map((item) => {
    if (item.href.startsWith("#")) return item.href;

    return `#${item.href}`;
  });

  // Hook para detectar qual âncora está visível
  const anchorVisible = useVisibleAnchor(anchorIds, {
    threshold: 0.1, // Reduza o threshold
    rootMargin: "-40px 0px -40% 0px", // Menos agressivo no bottom
  });

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const baseClasses = {
    mobile:
      "text-left text-foreground hover:text-primary transition-colors duration-200 py-2",
    desktop:
      "text-header-nav-links transition-colors duration-200 relative group font-bold",
    footer:
      "text-muted-foreground hover:text-primary transition-colors duration-200 relative group ",
    notFoundPage:
      "text-foreground hover:text-primary transition-colors duration-200 relative group font-bold  ",
  } as const;

  const totalOfItems = navItems.length;

  return (
    <>
      {navItems.map((item, i) => {
        const isActive =
          item.type === "anchor" && variant !== "footer"
            ? anchorVisible === item.href
            : anchorVisible === `#${item.href}` || pathName === `/${item.href}`;

        if (item.type === "anchor") {
          return (
            <React.Fragment key={item.href}>
              <button
                onClick={() => scrollToSection(item.href)}
                className={cn(baseClasses[variant], isActive && "text-primary")}
              >
                {item.label}
                {variant !== "mobile" && (
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300",
                      isActive ? "w-full" : "group-hover:w-full"
                    )}
                  />
                )}
              </button>
              {totalOfItems != i + 1 && variant === "notFoundPage" && (
                <span>|</span>
              )}
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={item.href}>
            <Link key={item.href} href={`/${item.href}`}>
              <button
                className={cn(baseClasses[variant], isActive && "text-primary")}
              >
                {item.label}
                {variant !== "mobile" && (
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300",
                      isActive ? "w-full" : "group-hover:w-full"
                    )}
                  />
                )}
              </button>
            </Link>
            {totalOfItems != i + 1 && variant === "notFoundPage" && (
              <span>|</span>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
