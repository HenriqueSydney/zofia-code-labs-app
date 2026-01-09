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
import { MoreHorizontal, Trash2, Pencil, Key, UserRoundX } from "lucide-react"; // Ícones adicionais
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

interface IClientEmployeeActions {
  employee: ClientEmployeesWithDetails;
  clientSlug: string;
}

export function ClientEmployeeActions({
  clientSlug,
  employee,
}: IClientEmployeeActions) {
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
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setIsPasswordResetModalOpen(true);
            }}
          >
            <Key className="mr-2 h-4 w-4" /> Redefinir Senha
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              setIsRemoveModalOpen(true);
            }}
          >
            <UserRoundX className="mr-2 h-4 w-4" /> Desativar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={isEditClientEmployeeModalOpen}
        onOpenChange={setIsEditClientEmployeeModalOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Esta ação irá atualizar os dados do usuário{" "}
              <strong>{employee.user.name}</strong>.
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
            <DialogTitle>Remover Usuário</DialogTitle>
            <DialogDescription>
              Esta ação irá inativar o acesso de{" "}
              <strong>{employee.user.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Ao remover o usuário, este será inativado, permanecendo na lista
              apenas para fins de auditoria histórica.
            </p>
            <p className="font-medium">Confirma que deseja inativá-lo?</p>

            <div className="w-full flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRemoveModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveEmployee}
              >
                Inativar usuário
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
            <DialogTitle>Redefinir Senha de Usuário</DialogTitle>
            <DialogDescription>
              Esta senha irá redefinir a senha de{" "}
              <strong>{employee.user.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Ao redefinir a senha, o usuário irá receber um email com a nova
              senha e as orientações para alteração da senha gerada.
            </p>
            <p className="font-medium">
              Confirma que deseja redefinir a senha?
            </p>

            <div className="w-full flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordResetModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleResetEmployeePassword}
              >
                Redefinir senha
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
