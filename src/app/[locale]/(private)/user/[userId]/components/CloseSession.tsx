"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export function CloseSession() {
  const t = useTranslations("userProfile");
  return (
    <button
      onClick={() => signOut({ redirect: true, redirectTo: "/" })}
      className="mt-3 text-destructive  text-sm font-medium"
    >
      {t("activeSessions.close")}
    </button>
  );
}
