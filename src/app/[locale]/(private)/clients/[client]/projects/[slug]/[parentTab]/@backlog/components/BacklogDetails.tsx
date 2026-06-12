"use client";
import { Button } from "@/components/ui/button";
import { BacklogItemWithDetails } from "@/repositories/IBacklogItemsRepository";
import { Hash } from "lucide-react";

import { getBacklogPriorityBadge } from "@/mappers/getBacklogPriorityBadge";
import { getBacklogStatusLabel } from "@/mappers/BacklogMappers";
import { deleteBacklogAction } from "@/actions/backlog/deleteBacklogItemAction";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface IBacklogDetails {
  item: BacklogItemWithDetails;
  setIsDialogOpen: (value: boolean) => void;
  setIsEditOpen: (value: boolean) => void;
  canManageBacklog: boolean;
}
export function BacklogDetails({
  item,
  setIsDialogOpen,
  setIsEditOpen,
  canManageBacklog,
}: IBacklogDetails) {
  const t = useTranslations("projects.backlog");
  const tDetails = useTranslations("projects.backlog.details");
  const tStatus = useTranslations("projects.backlog.status");
  const tPriority = useTranslations("projects.backlog.priorityLabels");
  const tCommon = useTranslations("common.actions");
  const params = useParams();
  const handleDeleteItem = async () => {
    const result = await deleteBacklogAction({
      id: item.id,
      projectSlug: params.slug as string,
    });

    if (!result.success) {
      toast.error(result.message ?? tDetails("deleteError"));
      return;
    }

    toast.success(tDetails("deleteSuccess"));
    setIsDialogOpen(false);
  };

  return (
    <div className="pb-6 space-y-6">
      {/* Seção Principal: Título */}
      <div className="space-y-1">
        <span className="text-sm font-semibold  tracking-wider ">
          {tDetails("title")}
        </span>
        <p className="text-lg font-medium leading-tight">{item.title}</p>
      </div>

      {/* Grid de Informações Secundárias */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <span className="text-sm font-semibold  ">{tDetails("status")}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {getBacklogStatusLabel(item.status, (key) =>
                tStatus(key as never),
              )}
            </span>
          </div>
        </div>

        <div className="space-y-1 md:col-span-2">
          <span className="text-sm font-semibold  ">
            {tDetails("priority")}
          </span>
          <div>
            {getBacklogPriorityBadge(item.priority, (key) =>
              tPriority(key as never),
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <span className="text-sm font-semibold  ">{tDetails("points")}</span>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Hash className="w-3 h-3" />
            {item.points ?? 0} pts
          </div>
        </div>

        <div className="space-y-1 md:col-span-2">
          <span className="text-sm font-semibold  ">
            {tDetails("assignee")}
          </span>
          <p className="text-sm font-medium">
            {item.assignee?.name ?? tDetails("unassigned")}
          </p>
        </div>
      </div>

      <hr className="border-muted/50" />

      {/* Descrição */}
      <div className="space-y-2">
        <span className="text-sm font-semibold  ">
          {tDetails("detailedDescription")}
        </span>
        <div className="text-sm text-foreground/90 bg-muted/30 p-2 rounded-lg leading-relaxed whitespace-pre-wrap">
          {item.description || t("noDescription")}
        </div>
      </div>

      {/* Link Externo se existir */}
      {item.externalLink && (
        <div className="space-y-1">
          <span className="text-sm font-semibold  text-muted-foreground">
            {tDetails("externalReference")}
          </span>
          <a
            href={item.externalLink}
            target="_blank"
            className="text-sm text-primary flex items-center gap-1 hover:underline"
          >
            {item.externalLink}
          </a>
        </div>
      )}

      {canManageBacklog && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-destructive/30!"
              onClick={handleDeleteItem}
            >
              {tCommon("delete")}
            </Button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
            >
              {tCommon("close")}
            </Button>
            <Button size="sm" onClick={() => setIsEditOpen(true)}>
              {tDetails("editTask")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
