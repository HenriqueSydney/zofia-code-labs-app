"use client";

import { useTransition } from "react";
import { syncUmamiMetricsAction } from "@/actions/integrations/umami/syncUmamiMetricsAction";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react"; // Ícone de sincronização
import { cn } from "@/lib/utils";

interface ISyncUmamiMetrics {
  projectSlug: string;
}

export function SyncUmamiMetrics({ projectSlug }: ISyncUmamiMetrics) {
  const [isPending, startTransition] = useTransition();

  const handleSyncMetrics = () => {
    // Criamos um ID para o toast para podermos atualizá-lo (evita spam de toasts)
    const toastId = toast.loading("Sincronizando métricas com Umami...");

    startTransition(async () => {
      try {
        const result = await syncUmamiMetricsAction(projectSlug);

        if (!result.success) {
          throw new Error(result.message);
        }

        toast.success("Métricas atualizadas com sucesso", { id: toastId });
      } catch (error) {
        console.error("Sync Error:", error);
        toast.error("Falha na sincronização. Verifique os logs.", {
          id: toastId,
        });
      }
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleSyncMetrics}
      disabled={isPending}
      className="gap-2"
      title="Sincronizar base de dados com Umami"
    >
      <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
    </Button>
  );
}
