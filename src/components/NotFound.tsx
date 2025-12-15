"use client";

import { ArrowLeft, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "../i18n/navigation";
import { Button } from "./ui/button";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main className="flex-1 flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8 inline-block">
          <div className="text-8xl md:text-9xl font-bold gradient-text animate-gradient-shift">
            404
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("title")}</h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          {t("description")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button size="lg" className="gap-2 rounded-full hover-lift">
              <Home className="h-5 w-5" />
              {t("home")}
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            className="gap-2 rounded-full hover-lift"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
            {t("back")}
          </Button>
        </div>

        <div className="mt-12 p-6 glass-effect rounded-2xl border border-border/40">
          <p className="text-sm text-muted-foreground">{t("help")}</p>
        </div>
      </div>
    </main>
  );
}
