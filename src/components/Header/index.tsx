"use client";

import Image from "next/image";
import { ThemeToggle } from "./ThemeToogle";
import { InternalizationSelect } from "./InternalizationSelect";
import Link from "next/link";
import { useVisibleAnchor } from "@/hooks/use-visible-anchor";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/twMerge";
import { getMenuItems } from "@/mappers/menuItems";
import { getHref } from "@/utils/getHref";
import { SupportedLocales } from "@/i18n/routing";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";

const Header = () => {
  const t = useTranslations();
  const locale = useLocale() as SupportedLocales;

  const [isScrolled, setIsScrolled] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems: any = [];

  const anchorIds = menuItems.map((item) => item.id);

  // Hook para detectar qual seção está visível
  const anchorVisible = useVisibleAnchor(anchorIds, {
    threshold: 0.1,
    rootMargin: "-40px 0px -40% 0px",
  });

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-border shadow-sm"
          : "bg-transparent border-transparent"
      )}
    >
      <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/zofia-logo.webp"
            alt="Sophia Code Labs Logo"
            width={150}
            height={40} // Ajuste a altura para manter proporção se necessário
            className="object-contain"
          />
        </Link>

        {/* Menu Desktop Dinâmico */}
        <div className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={getHref(locale, pathname, item.href)}
              aria-label={item.ariaLabel}
              className={cn(
                "font-medium transition-colors hover:text-primary",
                // Aplica a cor primária se a âncora estiver visível
                anchorVisible === item.id
                  ? "text-primary"
                  : "text-foreground/80"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="md:hidden text-foreground"
            variant="outline"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
          <ThemeToggle />
          <InternalizationSelect />
        </div>
      </nav>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-md border-t border-border animate-fade-in">
          <ul className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  key={item.id}
                  href={getHref(locale, pathname, item.href)}
                  aria-label={item.ariaLabel}
                  className="text-foreground hover:text-primary transition-colors font-medium w-full text-left block"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
