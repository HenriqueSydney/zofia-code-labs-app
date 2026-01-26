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
import { IntegrationTypeForm } from "./IntegrationTypeForm";
import { useState } from "react";
import { toast } from "sonner";
import { deleteIntegrationTypeAction } from "@/actions/integrations/deleteIntegrationTypeAction";

interface IIntegrationTypeRemoveOrEdit {
  integration: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    deletedAt: Date | null;
  };
}

export function IntegrationTypeRemoveOrEdit({
  integration,
}: IIntegrationTypeRemoveOrEdit) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function handleDelete(id: string) {
    const result = await deleteIntegrationTypeAction(id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Tipo de Integração criado com sucesso!");
  }

  return (
    <div className="flex">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="flex items-center justify-center"
          >
            <Edit className="h-4 w-4 " />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{"Editar Tipo de Integração"}</DialogTitle>
            <DialogDescription>
              Preencha os dados do tipo de integração
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 "></div>
          <IntegrationTypeForm
            integration={integration}
            handleCloseModal={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => handleDelete(integration.id)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
