"use client";

import { reorderBacklogItemAction } from "@/actions/backlog/reorderBacklogItemAction";
import { useRouter } from "@/i18n/navigation";
import { backlogStatusMapper } from "@/mappers/BacklogMappers";
import { BacklogItemWithDetails } from "@/repositories/IBacklogItemsRepository";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KanbanColumn } from "./KanbanColumn"; // Importe o componente criado acima
import { EmptyState } from "@/components/EmptyState";
import { ListTodo } from "lucide-react";

// ... (definição do statusColumns mantém igual)
const statusColumns = [
  { key: "TODO", label: backlogStatusMapper["TODO"], color: "bg-muted" },
  {
    key: "IN_PROGRESS",
    label: backlogStatusMapper["IN_PROGRESS"],
    color: "bg-accent/20",
  },
  {
    key: "REVIEW",
    label: backlogStatusMapper["REVIEW"],
    color: "bg-primary/20",
  },
  { key: "DONE", label: backlogStatusMapper["DONE"], color: "bg-green-500/20" },
  {
    key: "CANCELED",
    label: backlogStatusMapper["CANCELED"],
    color: "bg-red-500/20",
  },
];

interface IBacklogKanban {
  backlog: BacklogItemWithDetails[];
}

export function BacklogKanban({ backlog }: IBacklogKanban) {
  // Inicializa o estado com o backlog
  const [items, setItems] = useState<BacklogItemWithDetails[]>(backlog);
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();

  // Atualiza o estado se a prop backlog mudar (ex: vinda do servidor após refresh)
  useEffect(() => {
    setItems(backlog);
  }, [backlog]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Helper para achar a coluna (status) baseada em um ID (seja de item ou da própria coluna)
  const findColumn = (id: string) => {
    if (statusColumns.find((col) => col.key === id)) return id;
    return items.find((item) => item.id === id)?.status;
  };

  const handleDragOver = (event: DragOverEvent) => {
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
      (item) => item.status === overColumn
    );
    const allSortedIds = targetColumnItems.map((i) => i.id);

    // Encontra o index do item dentro da sua NOVA coluna
    const newPositionIndex = targetColumnItems.findIndex(
      (i) => i.id === active.id
    );

    toast.dismiss();
    toast.info("Salvando...");

    try {
      await reorderBacklogItemAction({
        id: active.id as string,
        allSortedIds,
        newPositionIndex,
        status: overColumn as any,
      });
      toast.dismiss();
      toast.success("Salvo!");
    } catch (e) {
      toast.dismiss();
      toast.error("Erro ao salvar.");
      setItems(backlog); // Reverte em caso de erro
      router.refresh();
    }
  };

  if (backlog.length === 0) {
    return (
      <EmptyState
        title="Backlog do Produto"
        icon={ListTodo}
        description="Nenhum item de backlog cadastrado até o momento. Inicie a gestão do backlog com o cadastramento de ao menos 1 item."
      />
    );
  }

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
          />
        ))}
      </div>
    </DndContext>
  );
}
