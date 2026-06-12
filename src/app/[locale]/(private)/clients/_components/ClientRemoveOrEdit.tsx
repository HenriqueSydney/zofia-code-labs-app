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
import { ClientForm } from "./ClientForm";
import { useState } from "react";
import { toast } from "sonner";
import { deleteClientAction } from "@/actions/clients/deleteClientAction";
import { useTranslations } from "next-intl";

interface IServiceTypeRemoveOrEdit {
  canUpdate: boolean;
  canDelete: boolean;
  client: {
    id: string;
    companyName: string;
    tradeName?: string | null;
    cnpj?: string | null;
    email?: string | null;
    phone?: string | null;
    responsibleName?: string | null;
    responsibleEmail?: string | null;
    responsiblePhone?: string | null;
    organizationId: string;
  };
}

export function ClientRemoveOrEdit({
  client,
  canUpdate,
  canDelete,
}: IServiceTypeRemoveOrEdit) {
  const t = useTranslations("clients");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function handleDelete(id: string) {
    const result = await deleteClientAction(id);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(t("toast.removed"));
  }

  return (
    <div className="flex">
      {canUpdate && (
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("dialog.editTitle")}</DialogTitle>
              <DialogDescription>
                {t("dialog.editDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4"></div>
            <ClientForm
              client={client}
              handleCloseModal={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
      {canDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => handleDelete(client.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}
