"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface IGoBackButton {
  withLabel?: boolean;
  className?: string;
}

export function GoBackButton({ withLabel = true, className }: IGoBackButton) {
  const router = useRouter();

  return (
    <Button
      variant="link"
      className={cn(
        "group p-0 h-auto text-muted-foreground hover:text-primary hover:no-underline font-medium transition-colors",
        className,
      )}
      onClick={() => router.back()}
    >
      <ArrowLeft className="!w-5 !h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
      {withLabel && "Voltar"}
    </Button>
  );
}
