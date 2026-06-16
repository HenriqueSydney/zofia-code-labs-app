"use client";

import { changeBacklogStatusAction } from "@/actions/backlog/changeBacklogItemStatusAction";
import { reorderBacklogItemAction } from "@/actions/backlog/reorderBacklogItemAction";
import { useRouter } from "@/i18n/navigation";
import { BacklogItemWithDetails } from "@/repositories/IBacklogItemsRepository";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  Over,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { BacklogStatus } from "@/generated/prisma/enums";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { KanbanColumn } from "./KanbanColumn";
import { useTranslations } from "next-intl";
import { getBacklogStatusLabel } from "@/mappers/BacklogMappers";

interface IBacklogKanban {
  backlog: BacklogItemWithDetails[];
  canManageBacklog: boolean;
}

const COLUMN_KEYS = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
  "CANCELED",
] as const satisfies readonly BacklogStatus[];

function isColumnKey(id: string): id is BacklogStatus {
  return COLUMN_KEYS.includes(id as BacklogStatus);
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

  const [items, setItems] = useState<BacklogItemWithDetails[]>(backlog);
  const itemsRef = useRef<BacklogItemWithDetails[]>(backlog);
  const originalItemsRef = useRef<BacklogItemWithDetails[]>(backlog);
  const lastOverColumnRef = useRef<BacklogStatus | null>(null);
  const router = useRouter();

  useEffect(() => {
    itemsRef.current = backlog;
    setItems(backlog);
  }, [backlog]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const resolveOverColumn = (
    over: Over,
    sourceItems: BacklogItemWithDetails[],
  ): BacklogStatus | undefined => {
    if (isColumnKey(String(over.id))) {
      return over.id as BacklogStatus;
    }

    const sortableContainerId = over.data.current?.sortable?.containerId;
    if (
      typeof sortableContainerId === "string" &&
      isColumnKey(sortableContainerId)
    ) {
      return sortableContainerId;
    }

    return sourceItems.find((item) => item.id === over.id)?.status;
  };

  const moveItemToColumn = (
    prev: BacklogItemWithDetails[],
    activeId: string,
    overId: string,
    targetColumn: BacklogStatus,
    overRect?: { top: number; height: number },
    activeRect?: DragOverEvent["active"]["rect"],
  ) => {
    const activeIndex = prev.findIndex((i) => i.id === activeId);
    if (activeIndex < 0) return prev;

    const overIndex = prev.findIndex((i) => i.id === overId);
    let newIndex: number;

    if (isColumnKey(overId)) {
      const targetItems = prev.filter((item) => item.status === targetColumn);
      newIndex =
        targetItems.length > 0
          ? prev.findIndex((item) => item.id === targetItems.at(-1)!.id) + 1
          : prev.length + 1;
    } else {
      const isBelowOverItem =
        overRect &&
        activeRect?.current.translated &&
        activeRect.current.translated.top > overRect.top + overRect.height;

      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : prev.length + 1;
    }

    const newItems = [...prev];
    newItems[activeIndex] = {
      ...newItems[activeIndex],
      status: targetColumn,
    };

    return arrayMove(newItems, activeIndex, newIndex);
  };

  const reorderWithinColumn = (
    prev: BacklogItemWithDetails[],
    activeId: string,
    overId: string,
    column: BacklogStatus,
  ) => {
    const columnItems = prev.filter((item) => item.status === column);
    const activeIndex = columnItems.findIndex((item) => item.id === activeId);
    const overIndex = columnItems.findIndex((item) => item.id === overId);

    if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
      return prev;
    }

    const reorderedColumnItems = arrayMove(columnItems, activeIndex, overIndex);
    const otherItems = prev.filter((item) => item.status !== column);
    return [...otherItems, ...reorderedColumnItems];
  };

  const handleDragStart = (event: DragStartEvent) => {
    originalItemsRef.current = itemsRef.current;
    lastOverColumnRef.current = null;

    const activeId = event.active.id as string;
    const activeColumn = itemsRef.current.find((item) => item.id === activeId)
      ?.status;

    if (activeColumn) {
      lastOverColumnRef.current = activeColumn;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!canManageBacklog) return;

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const currentItems = itemsRef.current;

    const activeColumn =
      currentItems.find((item) => item.id === activeId)?.status ??
      resolveOverColumn(over, currentItems);
    const overColumn = resolveOverColumn(over, currentItems);

    if (!activeColumn || !overColumn) return;

    lastOverColumnRef.current = overColumn;

    if (activeColumn === overColumn) return;

    const newItems = moveItemToColumn(
      currentItems,
      activeId,
      overId,
      overColumn,
      over.rect,
      active.rect,
    );

    itemsRef.current = newItems;
    setItems(newItems);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!canManageBacklog) return;

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const originalItem = originalItemsRef.current.find((i) => i.id === activeId);
    if (!originalItem) return;

    let currentItems = itemsRef.current;
    let activeItemBeforeSave = currentItems.find((i) => i.id === activeId);
    if (!activeItemBeforeSave) return;

    let statusChanged = originalItem.status !== activeItemBeforeSave.status;
    const overColumn =
      lastOverColumnRef.current ??
      resolveOverColumn(over, currentItems) ??
      originalItem.status;

    if (!statusChanged && overColumn !== originalItem.status) {
      const placementOverId = isColumnKey(overId) ? overId : overColumn;

      currentItems = moveItemToColumn(
        currentItems,
        activeId,
        placementOverId,
        overColumn,
        over.rect,
        active.rect,
      );
      itemsRef.current = currentItems;
      setItems(currentItems);

      activeItemBeforeSave = currentItems.find((i) => i.id === activeId);
      if (!activeItemBeforeSave) return;

      statusChanged = originalItem.status !== activeItemBeforeSave.status;
    }

    if (!statusChanged) {
      const targetColumn =
        resolveOverColumn(over, currentItems) ?? originalItem.status;

      if (activeId !== overId) {
        currentItems = reorderWithinColumn(
          currentItems,
          activeId,
          overId,
          targetColumn,
        );
        itemsRef.current = currentItems;
        setItems(currentItems);
      }
    }

    const activeItem = currentItems.find((i) => i.id === activeId);
    if (!activeItem) return;

    const targetColumnItems = currentItems.filter(
      (item) => item.status === activeItem.status,
    );
    let allSortedIds = targetColumnItems.map((i) => i.id);
    let newPositionIndex = allSortedIds.findIndex((i) => i.id === activeId);

    if (newPositionIndex < 0) {
      allSortedIds = [activeId, ...allSortedIds];
      newPositionIndex = 0;
    }

    const originalColumnItems = originalItemsRef.current.filter(
      (item) => item.status === originalItem.status,
    );
    const originalPositionIndex = originalColumnItems.findIndex(
      (item) => item.id === activeId,
    );
    const positionChanged =
      statusChanged || originalPositionIndex !== newPositionIndex;

    if (!statusChanged && !positionChanged) return;

    toast.dismiss();
    toast.info(tCommon("saving"));

    try {
      if (statusChanged) {
        const statusResult = await changeBacklogStatusAction({
          id: activeId,
          status: activeItem.status,
        });

        if (!statusResult.success) {
          toast.dismiss();
          toast.error(statusResult.message ?? tCommon("errors.syncOrder"));
          itemsRef.current = backlog;
          setItems(backlog);
          return;
        }
      }

      if (positionChanged) {
        const reorderResult = await reorderBacklogItemAction({
          id: activeId,
          allSortedIds,
          newPositionIndex,
        });

        if (!reorderResult.success) {
          toast.dismiss();
          toast.error(reorderResult.message ?? tCommon("errors.syncOrder"));
          itemsRef.current = backlog;
          setItems(backlog);
          return;
        }
      }

      toast.dismiss();
      toast.success(tCommon("actions.saveChanges"));
      router.refresh();
    } catch {
      toast.dismiss();
      toast.error(tCommon("errors.connection"));
      itemsRef.current = backlog;
      setItems(backlog);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {statusColumns.map((column) => (
          <KanbanColumn
            key={column.key}
            column={column}
            items={items.filter((item) => item.status === column.key)}
            canManageBacklog={canManageBacklog}
          />
        ))}
      </div>
    </DndContext>
  );
}
