"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Shield, Pencil } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { PERMISSIONS_MAP } from "@/constants/permissions";
import { saveCustomRoleAction } from "@/actions/organization/saveCustomRoleAction";
import { FormInput } from "@/components/form/FormInput";

const roleSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  permissions: z.array(z.string()).refine((value) => value.length > 0, {
    message: "Selecione pelo menos uma permissão.",
  }),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormDialogProps {
  orgId: string;
  roleToEdit?: any;
}

export function RoleFormDialog({ orgId, roleToEdit }: RoleFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const isEditing = !!roleToEdit;

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: roleToEdit?.name || "",
      description: roleToEdit?.description || "",
      permissions: roleToEdit?.permissions || [],
    },
  });

  async function onSubmit(data: RoleFormData) {
    setIsPending(true);
    const result = await saveCustomRoleAction({
      ...data,
      id: roleToEdit?.id,
      orgId,
    });

    if (result.error) {
      toast.error(result.error);
      setIsPending(false);
      return;
    }

    toast.success(
      isEditing ? "Perfil atualizado!" : "Perfil criado com sucesso!",
    );
    setIsPending(false);
    handleOpenChange(false);
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && !isEditing) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Perfil
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        {/* HEADER FIXO */}
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle>
            {isEditing ? "Editar Perfil" : "Novo Perfil de Acesso"}
          </DialogTitle>
          <DialogDescription>
            Defina o nome do cargo e selecione as permissões granulares abaixo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* 1. ÁREA FIXA (Campos de Nome e Descrição) */}
            <div className="px-6 py-6 space-y-4 shrink-0 bg-background z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Nome do Cargo"
                  control={form.control}
                  name="name"
                  placeholder="Ex: Gestor de Projetos"
                />

                <div className="col-span-2">
                  <FormInput
                    label="Descrição"
                    control={form.control}
                    name="description"
                    placeholder="Breve descrição..."
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* 2. ÁREA DE ROLAGEM (Apenas Permissões) */}
            {/* overflow-y-auto AQUI garante que só isso role */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-muted/5 custom-scrollbar">
              <div>
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  Permissões do Sistema
                </h3>

                <FormField
                  control={form.control}
                  name="permissions"
                  render={() => (
                    <div className="space-y-4">
                      {PERMISSIONS_MAP.map((category) => (
                        <div
                          key={category.key}
                          className="border rounded-lg p-4 bg-background shadow-sm"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <category.icon className="w-5 h-5 text-primary" />
                            <h4 className="font-semibold text-sm">
                              {category.label}
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {category.permissions.map((perm) => (
                              <FormField
                                key={perm.key}
                                control={form.control}
                                name="permissions"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={perm.key}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(
                                            perm.key,
                                          )}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([
                                                  ...field.value,
                                                  perm.key,
                                                ])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) =>
                                                      value !== perm.key,
                                                  ),
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-medium cursor-pointer">
                                          {perm.label}
                                        </FormLabel>
                                        <FormDescription className="text-xs text-muted-foreground/80 hidden sm:block">
                                          {perm.description}
                                        </FormDescription>
                                      </div>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* 3. FOOTER FIXO */}
            <DialogFooter className="p-6 pt-4 border-t bg-background shrink-0">
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
                {isEditing ? "Salvar Alterações" : "Criar Perfil"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
