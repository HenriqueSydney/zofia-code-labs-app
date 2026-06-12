"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/Modal";
import { Form } from "@/components/ui/form";

import { PasswordStrengthBar } from "@/components/PasswordStrengthBar";

import {
  updatePasswordAction,
  type UpdatePasswordState,
} from "@/actions/users/updatePasswordAction";
import { setInvitePasswordAction } from "@/actions/users/setInvitePasswordAction";
import { FormSecretInput } from "@/components/form/FormSecretInput";

interface ChangePasswordFormProps {
  invitePasswordSetup?: boolean;
}

export function ChangePasswordForm({
  invitePasswordSetup = false,
}: ChangePasswordFormProps) {
  const t = useTranslations("userProfile");
  const tForm = useTranslations("userProfile.changePasswordForm");
  const tCommon = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const changePasswordSchema = z
    .object({
      currentPassword: invitePasswordSetup
        ? z.string().optional()
        : z.string().min(1, tForm("currentPasswordRequired")),
      newPassword: z.string().min(6, tForm("newPasswordMin")),
      confirmPassword: z.string().min(1, tForm("confirmPasswordRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: tForm("passwordsMismatch"),
      path: ["confirmPassword"],
    });

  type FormSchema = z.infer<typeof changePasswordSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [state, formAction] = useActionState(
    invitePasswordSetup ? setInvitePasswordAction : updatePasswordAction,
    {
      success: false,
      message: "",
    },
  );

  const newPasswordValue = form.watch("newPassword");

  useEffect(() => {
    if (searchParams.get("changePassword") === "1") {
      setIsModalOpen(true);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("changePassword");
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    }
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        setIsModalOpen(false);
        form.reset();
      } else {
        toast.error(state.message);

        if (!invitePasswordSetup) {
          const updateState = state as UpdatePasswordState;
          const currentPasswordError =
            updateState.errors?.currentPassword?.[0];

          if (currentPasswordError) {
            form.setError("currentPassword", {
              message: currentPasswordError,
            });
          }
        }
      }
    }
  }, [state, form]);

  const onSubmit = (data: FormSchema) => {
    const formData = new FormData();

    if (!invitePasswordSetup && data.currentPassword) {
      formData.append("currentPassword", data.currentPassword);
    }

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

  const modalTitle = invitePasswordSetup
    ? t("security.setPassword")
    : t("security.changePassword");

  const buttonLabel = invitePasswordSetup
    ? t("security.setPassword")
    : t("security.changePassword");

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className="gap-2 cursor-pointer"
      >
        <Key className="w-4 h-4" />
        {buttonLabel}
      </Button>

      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={handleOpenChange}
        modalTitle={modalTitle}
        className="max-w-lg"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {!invitePasswordSetup && (
              <FormSecretInput
                control={form.control}
                name="currentPassword"
                label={tForm("currentPasswordLabel")}
                placeholder={tForm("currentPasswordPlaceholder")}
                disabled={isPending}
              />
            )}

            <div className="space-y-2">
              <FormSecretInput
                control={form.control}
                name="newPassword"
                label={tForm("newPasswordLabel")}
                placeholder={tForm("newPasswordPlaceholder")}
                disabled={isPending}
              />

              {newPasswordValue && (
                <div className="animate-in fade-in slide-in-from-top-1">
                  <PasswordStrengthBar password={newPasswordValue} />
                </div>
              )}
            </div>

            <FormSecretInput
              control={form.control}
              name="confirmPassword"
              label={tForm("confirmPasswordLabel")}
              placeholder={tForm("confirmPasswordPlaceholder")}
              disabled={isPending}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                {isPending ? tCommon("updating") : tForm("saveButton")}
              </Button>
            </div>
          </form>
        </Form>
      </Modal>
    </>
  );
}
