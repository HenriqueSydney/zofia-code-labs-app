"use client";

import { getBacklogPriorityBadge } from "@/mappers/getBacklogPriorityBadge";
import { BacklogItemWithDetails } from "@/repositories/IBacklogItemsRepository";
import { GripVertical, Hash } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { BacklogDetailsModal } from "./BacklogDetailsModal";

interface IKanbanCard {
  item: BacklogItemWithDetails;
}

export const KanbanCard = ({ item }: IKanbanCard) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { type: "Card", item } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-background border flex rounded-lg p-0.5 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div
        {...attributes}
        {...listeners}
        className="mt-1 opacity-30 hover:opacity-100 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <BacklogDetailsModal key={item.id} item={item}>
        <button
          type="button" // Importante para não submeter formulários acidentalmente
          className={cn(
            "w-full cursor-pointer text-left rounded-lg", // Arredondamento para casar com o card
            "transition-all duration-300 ease-in-out",
            "hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)]",
            "hover:brightness-110",
            "hover:-translate-y-0.5" // Levanta levemente o card
          )}
        >
          <div className="flex-1 bg-background border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm leading-tight">
                  {item.title}
                </h4>
                {getBacklogPriorityBadge(item.priority)}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                  <Hash className="w-3 h-3" />
                  {item.points} pts
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                  {item.assignee?.name.split(" ")[0]}{" "}
                  {item.assignee?.name.split(" ").pop()}
                </span>
              </div>
            </div>
          </div>
        </button>
      </BacklogDetailsModal>
    </div>
  );
};
