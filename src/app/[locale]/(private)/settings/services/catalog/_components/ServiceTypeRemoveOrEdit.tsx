"use client";

import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("settings.services.catalog.form");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function handleDelete(id: string) {
    const result = await deleteServiceTypeAction(id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(t("toastDeleteSuccess"));
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("dialogEditTitle")}</DialogTitle>
            <DialogDescription>{t("dialogEditDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 "></div>
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
