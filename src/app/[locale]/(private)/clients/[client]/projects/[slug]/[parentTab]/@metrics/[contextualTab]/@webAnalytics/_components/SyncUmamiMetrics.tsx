"use client";

import { ValidationError } from "@/errors/ValidationError";
import { useTransition } from "react";
import { syncUmamiMetricsAction } from "@/actions/integrations/umami/syncUmamiMetricsAction";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { cn } from "@/utils/twMerge";
import { useTranslations } from "next-intl";

interface ISyncUmamiMetrics {
  projectSlug: string;
}

export function SyncUmamiMetrics({ projectSlug }: ISyncUmamiMetrics) {
  const t = useTranslations("projects.metrics.webAnalytics.sync");
  const [isPending, startTransition] = useTransition();

  const handleSyncMetrics = () => {
    const toastId = toast.loading(t("loading"));

    startTransition(async () => {
      try {
        const result = await syncUmamiMetricsAction(projectSlug);

        if (!result.success) {
          throw new ValidationError(result.message ?? t("error"));
        }

        toast.success(t("success"), { id: toastId });
      } catch (error) {
        console.error("Sync Error:", error);
        toast.error(t("error"), { id: toastId });
      }
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleSyncMetrics}
      disabled={isPending}
      className="gap-2"
      title={t("title")}
    >
      <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
    </Button>
  );
}
