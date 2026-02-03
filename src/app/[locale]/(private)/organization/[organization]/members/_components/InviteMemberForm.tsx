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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema de validação
const inviteMemberSchema = z.object({
  email: z.string().email("Insira um e-mail válido"),
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
            {/* Campo de E-mail */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail Corporativo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="colaborador@empresa.com"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Perfil (Role) */}
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil de Acesso</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* TODO: Buscar esses roles do banco via server component e passar como prop ou fetch client-side */}
                      <SelectItem value="admin">
                        Administrador (Padrão)
                      </SelectItem>
                      <SelectItem value="member">Membro (Padrão)</SelectItem>
                      {/* Aqui entrariam os Custom Roles mapeados */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
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
