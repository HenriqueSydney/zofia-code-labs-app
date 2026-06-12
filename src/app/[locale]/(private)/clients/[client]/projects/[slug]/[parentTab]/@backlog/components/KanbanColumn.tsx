"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BacklogItemWithDetails } from "@/repositories/IBacklogItemsRepository";
import { Hash } from "lucide-react";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  column: { key: string; label: string; color: string };
  items: BacklogItemWithDetails[];
  canManageBacklog: boolean;
}

export function KanbanColumn({ column, items, canManageBacklog }: KanbanColumnProps) {
  // 1. Torna a COLUNA inteira um alvo de drop
  const { setNodeRef } = useDroppable({
    id: column.key, // O ID da coluna será usado no 'over.id'
  });

  const columnPoints = items.reduce((acc, item) => acc + (item.points ?? 0), 0);

  return (
    <div className="flex flex-col gap-3 h-full min-h-[500px]">
      <div className={`${column.color} rounded-lg p-3`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{column.label}</h3>
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>{items.length}</span>
            <div className="flex items-center gap-1 text-xs font-medium text-white bg-primary/80 px-2 py-1 rounded-md">
              <Hash className="w-3 h-3" />
              {columnPoints} pts
            </div>
          </div>
        </div>
      </div>

      {/* 2. Conecta o ref do useDroppable no container dos cards */}
      <div
        ref={setNodeRef}
        className="flex-1 bg-muted/20 rounded-xl p-2 transition-colors"
      >
        <SortableContext
          id={column.key}
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 min-h-[100px]">
            {items.map((item) => (
              <KanbanCard key={item.id} item={item} canManageBacklog={canManageBacklog} />
            ))}
            {/* Placeholder visual para facilitar o drop em lista vazia */}
            {items.length === 0 && (
              <div className="h-full min-h-[100px] border-2 border-dashed rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                Arraste para cá
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
