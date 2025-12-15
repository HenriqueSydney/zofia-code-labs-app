"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Key, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assumindo que você tem um componente de Input
import { Label } from "@/components/ui/label"; // Assumindo componente de Label
import { Modal } from "@/components/Modal";
import { PasswordStrengthBar } from "@/components/PasswordStrengthBar"; // Seu componente fornecido
import { updatePasswordAction } from "@/actions/users/updatePasswordAction";

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

  // Estados para controlar visibilidade das senhas
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormSchema>({
    resolver: zodResolver(clientSchema),
  });

  // Observa o valor da nova senha para passar para a barra de força
  const newPasswordValue = watch("newPassword", "");

  const [state, formAction] = useActionState(updatePasswordAction, {
    success: false,
    message: "",
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        handleToggleModal();
        reset();
      } else {
        toast.error(state.message);
      }
    }
  }, [state, reset]);

  const onSubmit = (data: FormSchema) => {
    const formData = new FormData();
    formData.append("currentPassword", data.currentPassword);
    formData.append("newPassword", data.newPassword);
    formData.append("confirmPassword", data.confirmPassword);

    startTransition(() => {
      formAction(formData);
    });
  };

  const handleToggleModal = () => {
    setIsModalOpen((prev) => !prev);
    if (!isModalOpen) reset(); // Limpa form ao fechar
  };

  return (
    <>
      {/* Botão Gatilho (Pode ajustar o estilo conforme onde ele for renderizado) */}
      <Button
        variant="outline"
        onClick={handleToggleModal}
        className="gap-2 cursor-pointer"
      >
        <Key className="w-4 h-4" />
        {t("security.changePassword") || "Alterar Senha"}
      </Button>

      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        modalTitle={t("security.changePassword") || "Alteração de Senha"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Campo: Senha Atual */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                placeholder="Digite sua senha atual"
                {...register("currentPassword")}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-500 font-medium">
                {errors.currentPassword.message}
              </p>
            )}
            {/* Erro específico do servidor para senha atual incorreta */}
            {state?.errors?.currentPassword && (
              <p className="text-sm text-red-500 font-medium">
                {state.errors.currentPassword[0]}
              </p>
            )}
          </div>

          {/* Campo: Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                placeholder="Digite a nova senha"
                {...register("newPassword")}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Barra de Força da Senha */}
            {newPasswordValue && (
              <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                <PasswordStrengthBar password={newPasswordValue} />
              </div>
            )}

            {errors.newPassword && (
              <p className="text-sm text-red-500 font-medium">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Campo: Confirmar Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirme a nova senha"
                {...register("confirmPassword")}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Mensagem de Erro Genérica do Server */}
          {!state.success && state.message && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {state.message}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto cursor-pointer"
            >
              {isPending ? "Atualizando..." : "Salvar Nova Senha"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
