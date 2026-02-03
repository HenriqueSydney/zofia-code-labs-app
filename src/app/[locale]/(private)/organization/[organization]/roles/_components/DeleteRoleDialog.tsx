"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteCustomRoleAction } from "@/actions/organization/deleteOrganizationCustomRoleAction";

interface DeleteRoleDialogProps {
  roleId: string;
  roleName: string;
  disabled?: boolean;
}

export function DeleteRoleDialog({
  roleId,
  roleName,
  disabled = false,
}: DeleteRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setIsPending(true);
    try {
      await deleteCustomRoleAction(roleId);
      toast.success(`Perfil "${roleName}" excluído com sucesso.`);
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir perfil.");
    } finally {
      setIsPending(false);
    }
  }

  // Se estiver desabilitado (tem usuários usando), mostra botão bloqueado com Tooltip
  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {/* Span é necessário para o Tooltip funcionar em elementos disabled */}
            <span tabIndex={0}>
              <Button
                variant="ghost"
                size="icon"
                disabled
                className="text-muted-foreground/50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent className="bg-destructive text-destructive-foreground">
            <p>Não é possível excluir perfis em uso.</p>
            <p className="text-xs opacity-90">
              Remova os usuários deste perfil primeiro.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Excluir Perfil de Acesso
          </AlertDialogTitle>
          <AlertDialogDescription>
            Você tem certeza que deseja excluir o perfil{" "}
            <strong>{roleName}</strong>?
            <br />
            Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Impede fechamento automático para tratar o async
              handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:ring-destructive"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sim, excluir perfil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
