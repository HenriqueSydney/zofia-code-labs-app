import { getTranslations } from "next-intl/server";
import Image from "next/image";

const Footer = async () => {
  const t = await getTranslations();

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
          width={100}
          height={100}
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
