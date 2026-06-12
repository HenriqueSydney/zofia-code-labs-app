"use client";

import { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Phone, Building2 } from "lucide-react";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import {
  createClientFormSchema,
  ClientFormSchemaType,
} from "@/schemas/clients/clientFormSchema";
import { updateClientAction } from "@/actions/clients/updateClientAction";
import { createClientAction } from "@/actions/clients/createClientAction";
import { FormImageUpload } from "@/components/form/FormImageUpload";
import { FormInput } from "@/components/form/FormInput";
import { FormMaskInput } from "@/components/form/FormMaskInput";
import { useTranslations } from "next-intl";

interface IClientFormProps {
  client?: {
    id: string;
    companyName: string;
    tradeName?: string | null;
    cnpj?: string | null;
    email?: string | null;
    phone?: string | null;
    responsibleName?: string | null;
    responsibleEmail?: string | null;
    responsiblePhone?: string | null;
    logoUrl?: string | File | null;
  };
  handleCloseModal: () => void;
}

export function ClientForm({ client, handleCloseModal }: IClientFormProps) {
  const t = useTranslations("clients.form");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const [isPending, startTransition] = useTransition();
  const isEditing = !!client;

  const schema = useMemo(
    () => createClientFormSchema((key) => tValidation(key)),
    [tValidation],
  );

  const form = useForm<ClientFormSchemaType>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: client?.companyName ?? "",
      tradeName: client?.tradeName ?? "",
      cnpj: client?.cnpj ?? "",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
      responsibleName: client?.responsibleName ?? "",
      responsibleEmail: client?.responsibleEmail ?? "",
      responsiblePhone: client?.responsiblePhone ?? "",
      logo: client?.logoUrl ?? null,
    },
  });

  const onSubmit = (data: ClientFormSchemaType) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("companyName", data.companyName);
      formData.append("tradeName", data.tradeName || "");
      formData.append("cnpj", data.cnpj || "");
      formData.append("email", data.email || "");
      formData.append("phone", data.phone || "");
      formData.append("responsibleName", data.responsibleName || "");
      formData.append("responsibleEmail", data.responsibleEmail || "");
      formData.append("responsiblePhone", data.responsiblePhone || "");

      // LÓGICA DE UPLOAD:
      // 1. Se for File -> Usuário fez upload novo. Envia.
      // 2. Se for String -> Usuário manteve a imagem antiga. Não envia nada (backend mantém a atual).
      // 3. Se for Null -> Usuário removeu a imagem. (Dependendo do seu backend, envie uma flag ou nada).

      if (data.logo instanceof File) {
        formData.append("logo", data.logo);
      }
      // Opcional: Se quiser tratar remoção explicita
      // else if (data.logo === null && isEditing && client?.logoUrl) {
      //   formData.append("removeLogo", "true");
      // }

      const result = isEditing
        ? await updateClientAction(client.id, formData)
        : await createClientAction(formData);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      if (!isEditing) form.reset();
      handleCloseModal();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
        {/* Componente limpo: Não precisa passar previewUrl manual, ele lê do control */}
        <FormImageUpload
          control={form.control}
          name="logo"
          label={t("logoLabel")}
          description={t("logoHelper")}
          disabled={isPending}
        />

        <FormInput
          control={form.control}
          name="companyName"
          label={t("companyName")}
          placeholder={t("companyNamePlaceholder")}
          disabled={isPending}
        />

        <FormInput
          control={form.control}
          name="tradeName"
          label={t("tradeName")}
          placeholder={t("tradeNamePlaceholder")}
          disabled={isPending}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormMaskInput
            control={form.control}
            name="cnpj"
            label={t("cnpj")}
            mask="00.000.000/0000-00"
            placeholder="00.000.000/0001-99"
            disabled={isPending}
            Icon={Building2}
            unmask={true}
          />

          <FormMaskInput
            control={form.control}
            name="phone"
            label={t("phone")}
            mask="(00) 00000-0000"
            placeholder="(61) 99999-9999"
            disabled={isPending}
            Icon={Phone}
          />
        </div>

        <FormInput
          control={form.control}
          name="email"
          label={t("email")}
          type="email"
          placeholder={t("emailPlaceholder")}
          disabled={isPending}
        />

        <div className="pt-2 border-t">
          <p className="text-sm font-medium mb-3">{t("responsibleSection")}</p>
          <div className="space-y-4">
            <FormInput
              control={form.control}
              name="responsibleName"
              label={t("responsibleName")}
              placeholder={t("responsibleNamePlaceholder")}
              disabled={isPending}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="responsibleEmail"
                label={t("responsibleEmail")}
                type="email"
                placeholder={t("responsibleEmailPlaceholder")}
                disabled={isPending}
              />
              <FormMaskInput
                control={form.control}
                name="responsiblePhone"
                label={t("responsiblePhone")}
                mask="(00) 00000-0000"
                placeholder="(61) 99999-9999"
                disabled={isPending}
                Icon={Phone}
              />
            </div>
          </div>
        </div>

        <div className="w-full flex justify-end pt-4">
          <Button type="submit" disabled={isPending}>
            {isPending
              ? tCommon("saving")
              : isEditing
                ? tCommon("actions.saveChanges")
                : t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
