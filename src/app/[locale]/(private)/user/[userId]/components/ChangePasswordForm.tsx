"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/Modal";
import { Form } from "@/components/ui/form"; // Importante: Contexto do Form

// Componentes Customizados
import { PasswordStrengthBar } from "@/components/PasswordStrengthBar";

import { updatePasswordAction } from "@/actions/users/updatePasswordAction";
import { FormSecretInput } from "@/components/form/FormSecretInput";

const clientSchema = z
  .object({
    currentPassword: z.string().min(1, "A senha atual é obrigatória."),
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter no mínimo 6 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

type FormSchema = z.infer<typeof clientSchema>;

export function ChangePasswordForm() {
  const t = useTranslations("userProfile");
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hook Form
  const form = useForm<FormSchema>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Action State (React 19 / Next 14+)
  const [state, formAction] = useActionState(updatePasswordAction, {
    success: false,
    message: "",
  });

  // Watch para a barra de força
  const newPasswordValue = form.watch("newPassword");

  // Efeito para Feedback
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        setIsModalOpen(false);
        form.reset();
      } else {
        toast.error(state.message);

        // Se houver erro de campo específico vindo do server (ex: senha atual errada)
        if (state.errors?.currentPassword) {
          form.setError("currentPassword", {
            message: state.errors.currentPassword[0],
          });
        }
      }
    }
  }, [state, form]);

  const onSubmit = (data: FormSchema) => {
    const formData = new FormData();
    formData.append("currentPassword", data.currentPassword);
    formData.append("newPassword", data.newPassword);
    formData.append("confirmPassword", data.confirmPassword);

    startTransition(() => {
      formAction(formData);
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) form.reset();
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className="gap-2 cursor-pointer"
      >
        <Key className="w-4 h-4" />
        {t("security.changePassword") || "Alterar Senha"}
      </Button>

      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={handleOpenChange}
        modalTitle={t("security.changePassword") || "Alteração de Senha"}
        className="max-w-lg"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Senha Atual */}
            <FormSecretInput
              control={form.control}
              name="currentPassword"
              label="Senha Atual"
              placeholder="Digite sua senha atual"
              disabled={isPending}
            />

            {/* Nova Senha + Barra de Força */}
            <div className="space-y-2">
              <FormSecretInput
                control={form.control}
                name="newPassword"
                label="Nova Senha"
                placeholder="Digite a nova senha"
                disabled={isPending}
              />

              {/* Renderização condicional da barra de força */}
              {newPasswordValue && (
                <div className="animate-in fade-in slide-in-from-top-1">
                  <PasswordStrengthBar password={newPasswordValue} />
                </div>
              )}
            </div>

            {/* Confirmação */}
            <FormSecretInput
              control={form.control}
              name="confirmPassword"
              label="Confirmar Nova Senha"
              placeholder="Repita a nova senha"
              disabled={isPending}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                {isPending ? "Atualizando..." : "Salvar Nova Senha"}
              </Button>
            </div>
          </form>
        </Form>
      </Modal>
    </>
  );
}
