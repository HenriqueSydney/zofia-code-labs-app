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
import { CategoryOption, ServiceTypeForm } from "./ServiceTypeForm";

interface ServiceFormProps {
  categories: CategoryOption[];
}

export function CreateServiceTypeForm({ categories }: ServiceFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>"Novo Serviço</DialogTitle>
          <DialogDescription>Preencha os dados do serviço</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4"></div>
        <ServiceTypeForm
          categories={categories}
          handleCloseModal={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
