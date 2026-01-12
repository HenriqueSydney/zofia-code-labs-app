"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Plus } from "lucide-react";
import { IntegrationTypeForm } from "./IntegrationTypeForm";

export function CreateIntegrationTypeForm() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Novo Tipo de Integração
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Novo Tipo de Integração</DialogTitle>
          <DialogDescription>
            Preencha os dados do tipo de integração
          </DialogDescription>
        </DialogHeader>
        <IntegrationTypeForm handleCloseModal={() => setIsDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
