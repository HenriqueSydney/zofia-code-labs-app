"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrganizationMember } from "@/repositories/IOrganizationRepository";

interface RemoveMemberAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: OrganizationMember;
  orgId: string;
}

export function RemoveMemberAlertDialog({
  open,
  onOpenChange,
  member,
  orgId,
}: RemoveMemberAlertDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isPending, setIsPending] = useState(false);

  // Fallback para e-mail caso o usuário não tenha nome cadastrado
  const validationText = member.name || member.email;

  // REFATORAÇÃO: Limpa o input sempre que o modal for fechado ou aberto
  useEffect(() => {
    if (!open) setConfirmText("");
  }, [open]);

  // Validação insensível a espaços extras no início/fim
  const isMatch = confirmText.trim() === validationText;

  async function handleRemove() {
    if (!isMatch) return;

    setIsPending(true);
    try {
      // await removeMemberAction({ memberId: member.id, orgId });
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Membro removido com sucesso.");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao remover membro.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>Remover Membro</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Esta ação removerá <strong>{validationText}</strong> da organização.
            O usuário perderá o acesso imediatamente.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2 space-y-3">
          <Label htmlFor="confirm-removal" className="text-sm font-medium">
            Para confirmar, digite{" "}
            <span className="font-mono bg-muted px-1 rounded select-all">
              {validationText}
            </span>{" "}
            abaixo:
          </Label>
          <Input
            id="confirm-removal"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={validationText}
            className={
              !isMatch && confirmText.length > 0
                ? "border-red-300 focus-visible:ring-red-300"
                : ""
            }
            autoComplete="off"
            // Desabilita colar formatação
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text/plain");
              setConfirmText(text);
            }}
          />
        </div>

        <AlertDialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={!isMatch || isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Remoção
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
