"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
import { reorderBacklogItemAction } from "@/actions/backlog/reorderBacklogItemAction";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface IBacklogList {
  backlog: BacklogItemWithDetails[];
  canManageBacklog: boolean;
}

export function BacklogList({ backlog, canManageBacklog }: IBacklogList) {
  const t = useTranslations("projects.backlog");
  const tSave = useTranslations("settings.services.backlog.saveStatus");
  const tCommon = useTranslations("common");
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
    if (!canManageBacklog) return;
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

      const result = await reorderBacklogItemAction({
        id: active.id as string,
        allSortedIds,
        newPositionIndex,
      });

      if (!result.success) {
        toast.error(tCommon("errors.syncOrder"));
        setSaveIndicator("error");
        setItems(backlog); // Reverte para a prop inicial vinda do servidor
        return;
      }

      setSaveIndicator("saved");
      // Limpa o indicador após 2 segundos
      setTimeout(() => setSaveIndicator(null), 2000);
    } catch (error) {
      setSaveIndicator("error");
      toast.error(tCommon("errors.connection"));
      setItems(backlog); // Reverte em caso de erro de rede
    }
  };

  const itemsWithoutCancel = items.filter(
    (item) => item.status !== "CANCELED" && item.status !== "DONE",
  );

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>{t("listTitle")}</CardTitle>
          {saveIndicator && (
            <Badge variant="outline" className="text-muted-foreground">
              {saveIndicator === "saving" && tSave("saving")}
              {saveIndicator === "saved" && tSave("saved")}
              {saveIndicator === "error" && tSave("saving")}
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
              {itemsWithoutCancel
                .filter((item) => item.status !== "CANCELED")
                .map((item, index) => (
                  <SortableBacklogItem
                    canManageBacklog={canManageBacklog}
                    key={item.id}
                    item={item}
                    marginBotton={itemsWithoutCancel.length > index + 1}
                  />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
