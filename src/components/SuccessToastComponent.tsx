"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function SuccessToastComponent() {
  const t = useTranslations("components.successToast");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success(t("proposalGenerated"));
      const params = new URLSearchParams(searchParams.toString());
      params.delete("success");
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    }
  }, [searchParams]);

  return null;
}
