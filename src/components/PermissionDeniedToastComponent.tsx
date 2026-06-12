"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { usePathname, useRouter } from "@/i18n/navigation";

const SEARCH_PARAM_KEY = "erro";

export function PermissionDeniedToastComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tServer = useTranslations("errors.server");
  const lastShownMessage = useRef<string | null>(null);

  useEffect(() => {
    const raw = searchParams.get(SEARCH_PARAM_KEY);

    if (!raw || raw === lastShownMessage.current) {
      return;
    }

    lastShownMessage.current = raw;

    let message = raw;
    try {
      message = tServer(raw as Parameters<typeof tServer>[0]);
    } catch {
      message = raw;
    }

    toast.error(message);

    const params = new URLSearchParams(searchParams.toString());
    params.delete(SEARCH_PARAM_KEY);

    const nextUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;

    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams, tServer]);

  return null;
}
