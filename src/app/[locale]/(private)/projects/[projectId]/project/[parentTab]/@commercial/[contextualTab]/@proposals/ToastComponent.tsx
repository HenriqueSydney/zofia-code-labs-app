"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function ToastComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Proposta gerada com sucesso!");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("success");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams]);

  return null;
}
