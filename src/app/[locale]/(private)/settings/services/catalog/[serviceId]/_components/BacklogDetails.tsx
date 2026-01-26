"use client";
import { Button } from "@/components/ui/button";
import { Hash } from "lucide-react";

import { getBacklogPriorityBadge } from "@/mappers/getBacklogPriorityBadge";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { ServiceDefaultBacklogItemWithDetails } from "@/repositories/IServiceDefaultBacklogItemsRepository";
import { deleteServiceDefaultBacklogAction } from "@/actions/services/backlogs/deleteServiceDefaultBacklogItemAction";

interface IBacklogDetails {
  item: ServiceDefaultBacklogItemWithDetails;
  setIsDialogOpen: (value: boolean) => void;
  setIsEditOpen: (value: boolean) => void;
}
export function BacklogDetails({
  item,
  setIsDialogOpen,
  setIsEditOpen,
}: IBacklogDetails) {
  const handleDeleteItem = async () => {
    const result = await deleteServiceDefaultBacklogAction({
      id: item.id,
      serviceTypeId: item.serviceTypeId,
    });

    if (!result.success) {
      toast.error(result.message ?? "Erro ao tentar remover a Tarefa.");
      return;
    }

    toast.success("Tarefa removida com sucesso");
    setIsDialogOpen(false);
  };

  return (
    <div className="pb-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {/* Seção Principal: Título */}
        <div className="space-y-1 md:col-span-2">
          <span className="text-sm font-semibold  tracking-wider ">Título</span>
          <p className="text-lg font-medium leading-tight">{item.title}</p>
        </div>

        {/* Grid de Informações Secundárias */}

        <div className="space-y-1 ">
          <span className="text-sm font-semibold  ">Prioridade</span>
          <div>{getBacklogPriorityBadge(item.priority)}</div>
        </div>

        <div className="space-y-1">
          <span className="text-sm font-semibold  ">Pontos</span>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Hash className="w-3 h-3" />
            {item.points ?? 0} pts
          </div>
        </div>
      </div>
      <hr className="border-muted/50" />

      {/* Descrição */}
      <div className="space-y-2">
        <span className="text-sm font-semibold  ">Descrição detalhada</span>
        <div className="text-sm text-foreground/90 bg-muted/30 p-2 rounded-lg leading-relaxed whitespace-pre-wrap">
          {item.description || "Nenhuma descrição informada."}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t">
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-destructive/30!"
            onClick={handleDeleteItem}
          >
            Excluir
          </Button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(false)}
          >
            Fechar
          </Button>
          <Button size="sm" onClick={() => setIsEditOpen(true)}>
            Editar Tarefa
          </Button>
        </div>
      </div>
    </div>
  );
}
