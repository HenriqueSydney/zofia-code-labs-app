"use client";

import { reorderBacklogItemAction } from "@/actions/backlog/reorderBacklogItemAction";
import { useRouter } from "@/i18n/navigation";
import { BacklogItemWithDetails } from "@/repositories/IBacklogItemsRepository";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KanbanColumn } from "./KanbanColumn";
import { useTranslations } from "next-intl";
import { getBacklogStatusLabel } from "@/mappers/BacklogMappers";

interface IBacklogKanban {
  backlog: BacklogItemWithDetails[];
  canManageBacklog: boolean;
}

export function BacklogKanban({ backlog, canManageBacklog }: IBacklogKanban) {
  const tStatus = useTranslations("projects.backlog.status");
  const tCommon = useTranslations("common");

  const statusColumns = [
    {
      key: "TODO",
      label: getBacklogStatusLabel("TODO", (k) => tStatus(k as never)),
      color: "bg-muted",
    },
    {
      key: "IN_PROGRESS",
      label: getBacklogStatusLabel("IN_PROGRESS", (k) => tStatus(k as never)),
      color: "bg-accent/20",
    },
    {
      key: "REVIEW",
      label: getBacklogStatusLabel("REVIEW", (k) => tStatus(k as never)),
      color: "bg-primary/20",
    },
    {
      key: "DONE",
      label: getBacklogStatusLabel("DONE", (k) => tStatus(k as never)),
      color: "bg-green-500/20",
    },
    {
      key: "CANCELED",
      label: getBacklogStatusLabel("CANCELED", (k) => tStatus(k as never)),
      color: "bg-red-500/20",
    },
  ] as const;
  // Inicializa o estado com o backlog
  const [items, setItems] = useState<BacklogItemWithDetails[]>(backlog);
  const [_, setActiveId] = useState<string | null>(null);
  const router = useRouter();

  // Atualiza o estado se a prop backlog mudar (ex: vinda do servidor após refresh)
  useEffect(() => {
    setItems(backlog);
  }, [backlog]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Helper para achar a coluna (status) baseada em um ID (seja de item ou da própria coluna)
  const findColumn = (id: string) => {
    if (statusColumns.find((col) => col.key === id)) return id;
    return items.find((item) => item.id === id)?.status;
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!canManageBacklog) return;

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setItems((prev) => {
      const activeIndex = prev.findIndex((i) => i.id === activeId);
      const overIndex = prev.findIndex((i) => i.id === overId);

      let newIndex;

      if (statusColumns.some((col) => col.key === overId)) {
        newIndex = prev.length + 1;
      } else {
        // Cenário 2: Arrastou para cima de um CARD
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : prev.length + 1;
      }

      const newItems = [...prev];
      newItems[activeIndex] = {
        ...newItems[activeIndex],
        status: overColumn as any,
      };

      return arrayMove(newItems, activeIndex, newIndex);
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!canManageBacklog) return;

    const { active, over } = event;

    // Verifica se soltou fora ou no mesmo lugar (visualmente)
    if (!over) return;

    const activeItem = items.find((i) => i.id === active.id);
    const overColumn = findColumn(over.id as string); // Descobre a coluna final

    if (!activeItem || !overColumn) return;

    // Se houve mudança de posição ou status
    // Nota: Usamos o estado 'items' atual, que já foi alterado pelo DragOver

    // 1. Prepara dados para o Backend
    const targetColumnItems = items.filter(
      (item) => item.status === overColumn,
    );
    const allSortedIds = targetColumnItems.map((i) => i.id);

    // Encontra o index do item dentro da sua NOVA coluna
    const newPositionIndex = targetColumnItems.findIndex(
      (i) => i.id === active.id,
    );

    toast.dismiss();
    toast.info(tCommon("saving"));

    try {
      await reorderBacklogItemAction({
        id: active.id as string,
        allSortedIds,
        newPositionIndex,
        status: overColumn as any,
      });
      toast.dismiss();
      toast.success(tCommon("actions.saveChanges"));
    } catch (e) {
      toast.dismiss();
      toast.error(tCommon("errors.connection"));
      setItems(backlog); // Reverte em caso de erro
      router.refresh();
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e) => setActiveId(e.active.id as string)} // Opcional
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {statusColumns.map((column) => (
          <KanbanColumn
            key={column.key}
            column={column}
            // Passa os items filtrados do estado ATUAL
            items={items.filter((item) => item.status === column.key)}
            canManageBacklog={canManageBacklog}
          />
        ))}
      </div>
    </DndContext>
  );
}
