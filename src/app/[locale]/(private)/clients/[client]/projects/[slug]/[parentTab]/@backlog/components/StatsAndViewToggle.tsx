"use client";

import { Label } from "@/components/ui/label";
import { LayoutGrid, List } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { useTransition } from "react";

interface IStatsAndViewToggle {
  totalPoints: number;
  backlogLength: number;
  canManageBacklog: boolean;
}

export function StatsAndViewToggle({
  totalPoints,
  backlogLength,
  canManageBacklog,
}: IStatsAndViewToggle) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isKanbanView = searchParams.get("viewMode")?.toString() === "kanban";

  const handleToggleViewType = () => {
    const params = new URLSearchParams(searchParams);
    if (isKanbanView) {
      params.set("viewMode", "list");
    } else {
      params.set("viewMode", "kanban");
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">{backlogLength}</strong> itens
          pendentes
        </span>
        <span>
          <strong className="text-foreground">{totalPoints}</strong> pontos
        </span>
      </div>
      <div style={{ opacity: isPending ? 0.7 : 1 }}>
        <div className="flex items-center gap-3">
          <List
            className={`h-4 w-4 ${
              !isKanbanView ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <Switch
            id="view-mode"
            checked={isKanbanView}
            onCheckedChange={handleToggleViewType}
          />
          <LayoutGrid
            className={`h-4 w-4 ${
              isKanbanView ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <Label htmlFor="view-mode" className="text-sm text-muted-foreground">
            {isKanbanView ? "Kanban" : "Lista"}
          </Label>
        </div>
      </div>
    </div>
  );
}
