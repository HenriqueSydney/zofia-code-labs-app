"use client";

import Image from "next/image";
import { ThemeToggle } from "./ThemeToogle";
import { InternalizationSelect } from "./InternalizationSelect";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/twMerge";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";

const Header = () => {

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

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-border shadow-sm"
          : "bg-transparent border-transparent",
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
    </header>
  );
};

export default Header;
