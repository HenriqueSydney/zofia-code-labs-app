"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { FormSelect } from "@/components/form/FormSelect"; // Seu componente existente
import {
  CustomRoleWithUsage,
  OrganizationMember,
} from "@/repositories/IOrganizationRepository";
import { updateMemberRoleSchema } from "@/schemas/organization/updateMemberRoleSchema";
import { updateMemberRoleAction } from "@/actions/organization/updateMemberRoleAction";

const editRoleSchema = updateMemberRoleSchema.omit({ memberId: true });

type EditRoleFormData = z.infer<typeof editRoleSchema>;

interface EditMemberRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: OrganizationMember;
  orgId: string;
  customRolesList: CustomRoleWithUsage[];
}

export function EditMemberRoleDialog({
  open,
  onOpenChange,
  member,
  orgId,
  customRolesList,
}: EditMemberRoleDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<EditRoleFormData>({
    resolver: zodResolver(editRoleSchema),
    defaultValues: {
      customRoleId: member.customRoleId ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ customRoleId: member.customRoleId ?? "" });
    }
  }, [open, member, form]);

  async function onSubmit(data: EditRoleFormData) {
    setIsPending(true);

    const result = await updateMemberRoleAction({
      memberId: member.id,
      customRoleId: data.customRoleId,
    });

    if (result.error) {
      toast.error(result.error);
      setIsPending(false);
      return;
    }

    toast.success("Perfil atualizado com sucesso!");
    onOpenChange(false);
    setIsPending(false);
  }

  const customRoles = customRolesList.map((customRole) => ({
    label: customRole.name,
    value: customRole.id,
  }));

  const roleOptions = [
    { label: "Administrador", value: "admin" },
    { label: "Membro", value: "member" },
    { label: "Visualizador", value: "viewer" },
    ...customRoles,
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Alterar Perfil</DialogTitle>
          <DialogDescription>
            Alterando nível de acesso de{" "}
            <span className="font-medium text-foreground">{member.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormSelect
              label="Cargo / Perfil"
              control={form.control}
              name="customRoleId"
              options={roleOptions}
              placeholder="Selecione..."
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
