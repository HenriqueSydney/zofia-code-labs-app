"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { FormTextarea } from "@/components/form/FormTextarea";
import { FormCurrencyInput } from "@/components/form/FormCurrencyInput";
import { createServiceTypeAction } from "@/actions/services/createServiceTypeAction";
import {
  createServiceTypeSchema,
  type CreateServiceTypeSchema,
} from "@/schemas/services/createServiceTypeSchema";
import { updateServiceTypeAction } from "@/actions/services/updateServiceTypeAction";
import { CreateServiceDTO } from "@/repositories/IServiceTypeRepository";

export type CategoryOption = {
  id: string;
  name: string;
};

interface IServiceFormProps {
  categories: CategoryOption[];
  service?: CreateServiceDTO & { id: string };
  handleCloseModal: () => void;
}

export function ServiceTypeForm({
  categories,
  service,
  handleCloseModal,
}: IServiceFormProps) {
  const t = useTranslations("settings.services.catalog.form");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateServiceTypeSchema>({
    resolver: zodResolver(createServiceTypeSchema),
    defaultValues: {
      name: service?.name ?? "",
      description: service?.description ?? "",
      basePrice: service?.basePrice ?? 0,
      categoryId: service?.categoryId ?? "",
      active: service?.active ?? true,
    },
  });

  const onSubmit = (data: CreateServiceTypeSchema) => {
    startTransition(async () => {
      if (service) {
        const result = await updateServiceTypeAction({
          ...data,
          id: service.id,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(t("toastUpdateSuccess"));
        form.setValue("basePrice", data.basePrice);
        form.setValue("categoryId", data.categoryId);
        form.setValue("description", data.description);
        form.setValue("name", data.name);
        form.setValue("organizationId", data.organizationId);
        form.setValue("active", data.active);
        handleCloseModal();
        return;
      }
      const result = await createServiceTypeAction(data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(t("toastCreateSuccess"));
      form.reset();
      handleCloseModal();
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl"
      >
        <FormInput
          label={t("name")}
          control={form.control}
          name="name"
          placeholder={t("namePlaceholder")}
          disabled={isPending}
        />

        <FormSelect
          label={t("category")}
          control={form.control}
          name="categoryId"
          placeholder={t("categoryPlaceholder")}
          options={categories.map((cat) => ({
            value: cat.id,
            label: cat.name,
          }))}
          disabled={isPending}
        />

        <FormCurrencyInput
          control={form.control}
          name="basePrice"
          label={t("basePrice")}
          placeholder={t("basePricePlaceholder")}
          description={t("basePriceDescription")}
          disabled={isPending}
        />

        <FormTextarea
          label={t("description")}
          control={form.control}
          name="description"
          placeholder={t("descriptionPlaceholder")}
          className="resize-none"
          rows={4}
          disabled={isPending}
        />

        <div className="w-full flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && tCommon("saving")}
            {!isPending && service && t("edit")}
            {!isPending && !service && t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
