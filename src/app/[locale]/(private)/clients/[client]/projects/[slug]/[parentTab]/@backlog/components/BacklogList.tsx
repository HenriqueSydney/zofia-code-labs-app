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
import { EmptyState } from "@/components/EmptyState";
import { ListTodo } from "lucide-react";

interface IBacklogList {
  backlog: BacklogItemWithDetails[];
}

export function BacklogList({ backlog }: IBacklogList) {
  const [items, setItems] = useState(backlog);
  const [saveIndicator, setSaveIndicator] = useState<
    "Error ao salvar..." | "Salvando..." | "Salvo" | null
  >(null);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSaveIndicator("Salvando...");

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
        toast.error("Erro ao sincronizar ordem. Revertendo...");
        setSaveIndicator("Error ao salvar...");
        setItems(backlog); // Reverte para a prop inicial vinda do servidor
        return;
      }

      setSaveIndicator("Salvo");
      // Limpa o indicador após 2 segundos
      setTimeout(() => setSaveIndicator(null), 2000);
    } catch (error) {
      setSaveIndicator("Error ao salvar...");
      toast.error("Erro de conexão.");
      setItems(backlog); // Reverte em caso de erro de rede
    }
  };

  const itemsWithoutCancel = items.filter(
    (item) => item.status !== "CANCELED" && item.status !== "DONE"
  );

  if (itemsWithoutCancel.length === 0) {
    return (
      <EmptyState
        title="Backlog do Produto"
        icon={ListTodo}
        description="Nenhum item de backlog cadastrado até o momento. Inicie a gestão do backlog com o cadastramento de ao menos 1 item."
      />
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>Backlog do Produto</CardTitle>
          {saveIndicator && (
            <Badge variant="outline" className="text-muted-foreground">
              {saveIndicator}
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
