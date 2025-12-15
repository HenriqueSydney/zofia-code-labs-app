"use client";

import { Chrome, Github, Gitlab, Loader2 } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/twMerge";

export function LoginWithProviders() {
  const t = useTranslations("auth");
  const [isLoading, setIsLoading] = useState<
    "github" | "gitlab" | "google" | null
  >(null);

  async function handleSignIn(provider: "github" | "gitlab" | "google") {
    try {
      setIsLoading(provider);
      await signIn(provider);
    } finally {
      setIsLoading(null);
    }
  }

  const providers = [
    {
      id: "google",
      className: "bg-white border text-gray-700 hover:bg-gray-100",
      icon: <Chrome className="w-7 h-7 text-[#4285F4]" />,
    },
    {
      id: "github",
      className: "bg-neutral-900 hover:bg-neutral-800 text-white",
      icon: <Github className="w-4 h-4" />,
    },
    {
      id: "gitlab",
      className: "bg-orange-600 hover:bg-orange-500 text-white ",
      icon: <Gitlab className="w-4 h-4" />,
    },
  ] as const;

  return (
    <>
      <div className="my-10 grid gap-4">
        {providers.map(({ id, className, icon }) => (
          <Button
            key={id}
            size="lg"
            className={cn(
              "w-full h-11 p-6 flex items-center gap-2 text-lg font-medium",
              className
            )}
            onClick={() => handleSignIn(id)}
            aria-label={t(`loginWithProviders.providers.${id}`)}
            disabled={!!isLoading && isLoading !== id}
          >
            {isLoading === id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              icon
            )}
            {isLoading === id
              ? t("loginWithProviders.providers.loading")
              : t(`loginWithProviders.providers.${id}`)}
          </Button>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        {t("loginWithProviders.terms")}{" "}
        <Link href="/terms-of-use" target="_blank" className="underline">
          {t("loginWithProviders.termsLink")}
        </Link>
        .
      </p>
    </>
  );
}
