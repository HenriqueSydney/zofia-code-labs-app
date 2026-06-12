"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

import { BacklogItemWithDetails } from "@/repositories/IBacklogItemsRepository";
import { SortableBacklogItem } from "./SortableBacklogItem";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ServiceDefaultBacklogItemWithDetails } from "@/repositories/IServiceDefaultBacklogItemsRepository";
import { reorderServiceDefaultBacklogItemAction } from "@/actions/services/backlogs/reorderServiceDefaultBacklogItemAction";

interface IBacklogList {
  serviceTypeId: string;
  backlog: ServiceDefaultBacklogItemWithDetails[];
  canEditBacklog: boolean;
}

export function BacklogList({
  backlog,
  serviceTypeId,
  canEditBacklog,
}: IBacklogList) {
  const t = useTranslations("settings.services.backlog");
  const tCommon = useTranslations("common.errors");
  const [items, setItems] = useState(backlog);
  const [saveIndicator, setSaveIndicator] = useState<
    "error" | "saving" | "saved" | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!canEditBacklog) {
      toast.error(t("noEditPermission"));
      return;
    }

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSaveIndicator("saving");

    // 1. Calcule a nova lista PRIMEIRO (fora do setItems)
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const updatedList = arrayMove(items, oldIndex, newIndex);

    // 2. Atualize o estado visual imediatamente (Optimistic Update)
    setItems(updatedList);

    // 3. Agora os dados estão prontos para a Action
    try {
      const allSortedIds = updatedList.map((item) => item.id);
      const newPositionIndex = newIndex; // Você já calculou isso acima

      const result = await reorderServiceDefaultBacklogItemAction(
        serviceTypeId,
        {
          id: active.id as string,
          allSortedIds,
          newPositionIndex,
        },
      );

      if (!result.success) {
        toast.error(tCommon("syncOrder"));
        setSaveIndicator("error");
        setItems(backlog); // Reverte para a prop inicial vinda do servidor
        return;
      }

      setSaveIndicator("saved");
      // Limpa o indicador após 2 segundos
      setTimeout(() => setSaveIndicator(null), 2000);
    } catch (error) {
      setSaveIndicator("error");
      toast.error(tCommon("connection"));
      setItems(backlog); // Reverte em caso de erro de rede
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>{t("listTitleService")}</CardTitle>
          {canEditBacklog && saveIndicator && saveIndicator !== "error" && (
            <Badge variant="outline" className="text-muted-foreground">
              {t(`saveStatus.${saveIndicator}`)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y">
              {items.map((item, index) => (
                <SortableBacklogItem
                  key={item.id}
                  item={item}
                  marginBotton={items.length > index + 1}
                  canEditBacklog={canEditBacklog}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
