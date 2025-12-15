import { CodeXml, Coffee, Heart } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export async function ZofiaLogo() {
  const t = await getTranslations();
  return (
    <div className="inline-flex flex-col">
      <div className="flex items-center justify-center md:justify-start">
       
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{t("footer.madeWith")}</span>
        <CodeXml className="h-4 w-4 !henrique-lima-primary-text" />
        /
        <Heart className="h-4 w-4 !text-red-500 fill-current" />
        <span className="text-muted-foreground">{t("footer.andMuch")}</span>
        <Coffee className="h-4 w-4 !text-amber-600" />
      </div>
    </div>
  );
}
