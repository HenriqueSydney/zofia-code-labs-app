"use client";

import { ArrowLeft } from "lucide-react";

import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

export function GoBackButton() {
  const t = useTranslations("errorAndNotFoundPage");
  return (
    <Button asChild variant="outline" size="lg" className="group">
      <button onClick={() => window.history.back()}>
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        {t("goBackButton")}
      </button>
    </Button>
  );
}
