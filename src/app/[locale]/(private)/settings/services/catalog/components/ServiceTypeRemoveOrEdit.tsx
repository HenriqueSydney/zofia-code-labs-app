"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CategoryOption, ServiceTypeForm } from "./ServiceTypeForm";
import { useState } from "react";
import { deleteServiceTypeAction } from "@/actions/services/deleteServiceTypeAction";
import { toast } from "sonner";
import { CreateServiceDTO } from "@/repositories/IServiceTypeRepository";

interface IServiceTypeRemoveOrEdit {
  service: CreateServiceDTO & { id: string };
  categories: CategoryOption[];
}

export function ServiceTypeRemoveOrEdit({
  service,
  categories,
}: IServiceTypeRemoveOrEdit) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function handleDelete(id: string) {
    const result = await deleteServiceTypeAction(id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Serviço criado com sucesso!");
  }

  return (
    <div className="flex">
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="flex items-center justify-center"
          >
            <Edit className="h-4 w-4 " />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{"Editar Serviço"}</DialogTitle>
            <DialogDescription>Preencha os dados do serviço</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4"></div>
          <ServiceTypeForm
            categories={categories}
            service={service}
            handleCloseModal={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => handleDelete(service.id)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
