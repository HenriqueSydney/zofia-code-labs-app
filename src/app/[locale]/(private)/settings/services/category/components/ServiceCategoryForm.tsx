"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/form/FormInput";
import { FormTextarea } from "@/components/form/FormTextarea";
import { createServiceCategoryAction } from "@/actions/services/createServiceCategoryAction";
import {
  createServiceCategorySchema,
  type CreateServiceCategorySchema,
} from "@/schemas/services/createServiceCategorySchema";
import { updateServiceCategoryAction } from "@/actions/services/updateServiceCategoryAction";
import { CreateServiceCategoryDTO } from "@/repositories/IServiceCategoryRepository";

export type CategoryOption = {
  id: string;
  name: string;
};

interface IServiceFormProps {
  categories: CategoryOption[];
  serviceCategory?: CreateServiceCategoryDTO & { id: string };
  handleCloseModal: () => void;
}

export function ServiceCategoryForm({
  categories,
  serviceCategory,
  handleCloseModal,
}: IServiceFormProps) {
  const t = useTranslations("settings.services.category.form");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateServiceCategorySchema>({
    resolver: zodResolver(createServiceCategorySchema),
    defaultValues: {
      name: serviceCategory?.name ?? "",
      description: serviceCategory?.description ?? "",
      taxCode: serviceCategory?.taxCode ?? "",
    },
  });

  const onSubmit = (data: CreateServiceCategorySchema) => {
    startTransition(async () => {
      if (serviceCategory) {
        const result = await updateServiceCategoryAction(data);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(t("toastUpdateSuccess"));
        form.setValue("taxCode", data.taxCode);
        form.setValue("description", data.description);
        form.setValue("name", data.name);
        form.setValue("organizationId", data.organizationId);
        handleCloseModal();
        return;
      }
      const result = await createServiceCategoryAction(data);

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
        className="space-y-6 max-w-lg"
      >
        <FormInput
          label={t("name")}
          control={form.control}
          name="name"
          placeholder={t("namePlaceholder")}
          disabled={isPending}
        />

        <FormInput
          label={t("taxCode")}
          control={form.control}
          name="taxCode"
          placeholder="1.01"
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
            {!isPending && serviceCategory && t("edit")}
            {!isPending && !serviceCategory && t("create")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
