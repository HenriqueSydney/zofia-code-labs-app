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
import { CategoryOption, ServiceCategoryForm } from "./ServiceCategoryForm";
import { useState } from "react";
import { deleteServiceCategoryAction } from "@/actions/services/deleteServiceCategoryAction";
import { toast } from "sonner";
import { CreateServiceCategoryDTO } from "@/repositories/IServiceCategoryRepository";

interface IServiceCategoryRemoveOrEdit {
  serviceCategory: CreateServiceCategoryDTO & { id: string };
  categories: CategoryOption[];
}

export function ServiceCategoryRemoveOrEdit({
  serviceCategory,
  categories,
}: IServiceCategoryRemoveOrEdit) {
  const t = useTranslations("settings.services.category.form");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function handleDelete(id: string) {
    const result = await deleteServiceCategoryAction(id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(t("toastDeleteSuccess"));
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
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("dialogEditTitle")}</DialogTitle>
            <DialogDescription>{t("dialogEditDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4"></div>
          <ServiceCategoryForm
            categories={categories}
            serviceCategory={serviceCategory}
            handleCloseModal={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => handleDelete(serviceCategory.id)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
