"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";

// Schema de validação
const inviteMemberSchema = z.object({
  email: z.email("Insira um e-mail válido"),
  nome: z
    .string("Insira um nome válido")
    .min(3, { error: "O nome deve ter no mínimo 3 caracteres" }),
  roleId: z.string().min(1, "Selecione um perfil de acesso"),
});

type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

interface InviteMemberFormProps {
  orgId: string;
}

export function InviteMemberForm({ orgId }: InviteMemberFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Hook Form
  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      roleId: "",
    },
  });

  // Função de submit
  async function onSubmit(data: InviteMemberFormData) {
    setIsPending(true);
    try {
      // TODO: Chamar sua Server Action de convite aqui
      // await inviteMemberAction({ ...data, orgId });

      // Simulação
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(`Convite enviado para ${data.email}`);
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Erro ao enviar convite. Tente novamente.");
    } finally {
      setIsPending(false);
    }
  }

  const defaultRoleOptions = [
    {
      label: "Administrador (Padrão)",
      value: "admin",
    },
    {
      label: "Membro (Padrão)",
      value: "member",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Convidar Membro
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convidar Membro</DialogTitle>
          <DialogDescription>
            Envie um convite por e-mail para um novo membro da sua equipe.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              control={form.control}
              name="name"
              label="Nome"
              Icon={Mail}
            />

            <FormInput
              control={form.control}
              name="email"
              label="E-mail Corporativo"
              type="email"
              placeholder="colaborador@empresa.com"
              Icon={Mail}
            />

            <FormSelect
              label="Perfil de Acesso"
              control={form.control}
              name="roleId"
              options={defaultRoleOptions}
              placeholder="Selecione um perfil"
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Convite
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
