import { useTranslations } from "next-intl";
import Image from "next/image";

const Footer = () => {
  const t = useTranslations();

  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="footer"
      className="py-8 relative flex flex-col md:flex-row h-16 items-center justify-center border-t border-border px-6"
    >
      {/* A logo fica presa no canto esquerdo, sem empurrar o texto do centro */}
      <div className="relative md:absolute md:left-6 flex items-center">
        <Image
          src="/zofia-logo.webp"
          alt="Zofia Code Lab Logo"
          width={677}
          height={369}
          className="h-16 w-auto"
        />
      </div>

      {/* O texto fica no centro exato da div pai */}
      <span className="text-sm text-muted-foreground">
        &copy; {currentYear} Zofia Code Labs. {t("footer.rights")}
      </span>
    </footer>
  );
};

export default Footer;
