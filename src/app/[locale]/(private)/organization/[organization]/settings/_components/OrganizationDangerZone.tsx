"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { deleteOrganizationAction } from "@/actions/organization/deleteOrganizationAction";

interface OrganizationDangerZoneProps {
  orgId: string;
  orgSlug: string;
}

export function OrganizationDangerZone({
  orgId,
  orgSlug,
}: OrganizationDangerZoneProps) {
  const [open, setOpen] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    // Validação de segurança extra
    if (confirmSlug !== orgSlug) return;

    setIsPending(true);
    try {
      // TODO: Chamar Server Action
      // await deleteOrganizationAction(orgId);

      // Simulação
      await new Promise((r) => setTimeout(r, 2000));

      toast.success("Organização encerrada com sucesso.");

      // Redirecionar para fora, pois a org não existe mais
      router.push("/auth/login"); // Ou para uma tela de seleção de orgs
    } catch (error) {
      toast.error("Erro ao encerrar organização.");
      setIsPending(false); // Só para o loading se der erro, se for sucesso o router muda a página
    }
  }

  // Reseta o input quando fecha o modal
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) setConfirmSlug("");
  };

  return (
    <Card className="border-destructive/30 mt-6">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Zona de Perigo
        </CardTitle>
        <CardDescription>
          Ações irreversíveis relacionadas à sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5 gap-4">
          <div>
            <h4 className="font-medium text-destructive">
              Encerrar Organização
            </h4>
            <p className="text-sm text-muted-foreground max-w-[400px]">
              Isso excluirá permanentemente todos os projetos, membros,
              configurações e dados associados a <strong>{orgSlug}</strong>.
              Esta ação não pode ser desfeita.
            </p>
          </div>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="destructive">Encerrar Conta</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-destructive flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Tem certeza absoluta?
                </DialogTitle>
                <DialogDescription>
                  Esta ação é irreversível. Todos os dados da organização serão
                  apagados permanentemente dos nossos servidores.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="slug-confirm"
                    className="text-sm font-semibold"
                  >
                    Digite{" "}
                    <span className="font-mono bg-muted px-1 rounded">
                      {orgSlug}
                    </span>{" "}
                    para confirmar:
                  </Label>
                  <Input
                    id="slug-confirm"
                    value={confirmSlug}
                    onChange={(e) => setConfirmSlug(e.target.value)}
                    placeholder={orgSlug}
                    autoComplete="off"
                    className="font-mono"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={confirmSlug !== orgSlug || isPending}
                  className="w-full sm:w-auto"
                >
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sim, excluir {orgSlug}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
