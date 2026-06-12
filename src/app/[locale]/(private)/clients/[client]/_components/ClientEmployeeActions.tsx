"use client";

import { deleteClientEmployeeAction } from "@/actions/clients/deleteClientEmployeeAction";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientEmployeesWithDetails } from "@/repositories/IClientEmployeesRepository";
import { MoreHorizontal, Trash2, Pencil, Key, UserRoundX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resetClientEmployeePasswordAction } from "@/actions/clients/resetClientEmployeePasswordAction";
import { ClientEmployeeForm } from "./ClientEmployeeForm";
import { useTranslations } from "next-intl";

interface IClientEmployeeActions {
  employee: ClientEmployeesWithDetails;
  clientSlug: string;
}

export function ClientEmployeeActions({
  clientSlug,
  employee,
}: IClientEmployeeActions) {
  const t = useTranslations("clients.employees.actions");
  const tCommon = useTranslations("common.actions");
  const [isEditClientEmployeeModalOpen, setIsEditClientEmployeeModalOpen] =
    useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] =
    useState(false);

  const handleRemoveEmployee = async () => {
    const result = await deleteClientEmployeeAction(employee.id, clientSlug);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setIsRemoveModalOpen(false);
  };

  const handleResetEmployeePassword = async () => {
    const result = await resetClientEmployeePasswordAction(
      employee.id,
      clientSlug
    );

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setIsPasswordResetModalOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setIsEditClientEmployeeModalOpen(true);
            }}
          >
            <Pencil className="mr-2 h-4 w-4" /> {t("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setIsPasswordResetModalOpen(true);
            }}
          >
            <Key className="mr-2 h-4 w-4" /> {t("resetPassword")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setIsRemoveModalOpen(true);
            }}
          >
            <UserRoundX className="mr-2 h-4 w-4" /> {t("deactivate")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isEditClientEmployeeModalOpen}
        onOpenChange={setIsEditClientEmployeeModalOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("editUserTitle")}</DialogTitle>
            <DialogDescription>
              {t("editUserDescription", { name: employee.user.name ?? "" })}
            </DialogDescription>
          </DialogHeader>

          <ClientEmployeeForm
            clientSlug={clientSlug}
            employee={{
              jobTitle: employee.jobTitle,
              email: employee.user.email,
              id: employee.id,
              name: employee.user.name,
              permissionRole: employee.permissionRole,
            }}
            handleCloseModal={() => setIsEditClientEmployeeModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isRemoveModalOpen} onOpenChange={setIsRemoveModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("removeUserTitle")}</DialogTitle>
            <DialogDescription>
              {t("removeUserDescription", { name: employee.user.name ?? "" })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">{t("removeUserHint")}</p>
            <p className="font-medium">{t("confirmDeactivate")}</p>

            <div className="w-full flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRemoveModalOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveEmployee}
              >
                {t("deactivateUser")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPasswordResetModalOpen}
        onOpenChange={setIsPasswordResetModalOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("resetPasswordTitle")}</DialogTitle>
            <DialogDescription>
              {t("resetPasswordDescription", { name: employee.user.name ?? "" })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {t("resetPasswordHint")}
            </p>
            <p className="font-medium">{t("confirmResetPassword")}</p>

            <div className="w-full flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordResetModalOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleResetEmployeePassword}
              >
                {t("resetPasswordButton")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
