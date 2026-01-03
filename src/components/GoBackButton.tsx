"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

export function GoBackButton() {
  const router = useRouter();

  return (
    <Button
      variant="link"
      className="group p-0 h-auto text-muted-foreground hover:text-primary hover:no-underline font-medium transition-colors"
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
      Voltar
    </Button>
  );
}
