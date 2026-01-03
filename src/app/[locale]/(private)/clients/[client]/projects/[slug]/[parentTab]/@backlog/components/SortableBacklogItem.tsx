"use client";

import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { getBacklogPriorityBadge } from "@/mappers/getBacklogPriorityBadge";
import { getBacklogStatusBadge } from "@/mappers/getBacklogStatusBadge";
import { BacklogItemWithDetails } from "@/repositories/IBacklogItemsRepository";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Hash } from "lucide-react";
import { BacklogDetailsModal } from "./BacklogDetailsModal";

interface ISortableBacklogItem {
  item: BacklogItemWithDetails;
  marginBotton: boolean;
}

export function SortableBacklogItem({
  item,
  marginBotton = true,
}: ISortableBacklogItem) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-4 bg-background hover:bg-muted/40 flex gap-3 items-start",
        marginBotton && "border-b",
        !marginBotton && "rounded-b-md"
      )}
    >
      {/* O Drag Handle recebe os listeners e attributes */}
      <div
        {...attributes}
        {...listeners}
        className="mt-1 opacity-30 hover:opacity-100 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        {/* Linha 1: Título e Status */}
        <div className="flex justify-between items-start gap-4">
          <BacklogDetailsModal item={item}>
            <button
              type="button" // Importante para não submeter formulários acidentalmente
              className={cn(
                "text-left block w-full truncate pr-2", // text-left e block para agir como o h4
                "font-semibold text-sm cursor-pointer",
                "hover:text-primary hover:underline transition-all duration-300"
              )}
            >
              {item.title}
            </button>
          </BacklogDetailsModal>
          <div className="flex items-center gap-2 shrink-0">
            {/* Badges menores ou alinhados a direita */}
            {getBacklogPriorityBadge(item.priority)}
            {getBacklogStatusBadge(item.status)}
          </div>
        </div>

        {/* Linha 2: Descrição Controlada */}
        <p className="text-xs text-muted-foreground line-clamp-2 break-words leading-relaxed">
          {item.description}
        </p>

        {/* Linha 3: Metadados (Points + Avatar) */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
              <Hash className="w-3 h-3" />
              {item.points} pts
            </div>
          </div>

          {/* Avatar do Responsável */}
          {item.assignee && (
            <div className="flex items-center gap-2" title={item.assignee.name}>
              <UserAvatar
                userName={item.assignee.name}
                image={item.assignee.avatarUrl}
                size="tiny"
              />
              <span className="text-xs text-muted-foreground hidden sm:block">
                {item.assignee.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
