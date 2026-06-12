"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { getBacklogPriorityOptions } from "@/mappers/BacklogMappers";
import {
  defaultbacklogItemSchema,
  DefaultBacklogItemSchema,
} from "@/schemas/services/backlog/defaultBacklogItemSchema";
import { BacklogPriorityEnum } from "@/schemas/backlog/backlogItemSchema";
import { createServiceDefaultBacklogItemAction } from "@/actions/services/backlogs/createServiceDefaultBacklogItemAction";
import { updateServiceDefaultBacklogAction } from "@/actions/services/backlogs/updateServiceDefaultBacklogItemAction";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { FormTextarea } from "@/components/form/FormTextarea";
import { FormNumberInput } from "@/components/form/FormNumberInput";

interface IBacklogForm {
  serviceId: string;
  backlog?: DefaultBacklogItemSchema;
  handleCloseModal: () => void;
}

export function BacklogForm({
  serviceId,
  backlog,
  handleCloseModal,
}: IBacklogForm) {
  const t = useTranslations("settings.services.backlog.form");
  const tPriority = useTranslations("projects.backlog.priorityLabels");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(defaultbacklogItemSchema),
    defaultValues: {
      id: backlog?.id,
      title: backlog?.title ?? "",
      description: backlog?.description ?? "",
      priority: backlog?.priority ?? "LOW",
      points: backlog?.points ?? 0,
      serviceTypeId: serviceId,
    },
  });

  const onSubmit = (data: DefaultBacklogItemSchema) => {
    startTransition(async () => {
      try {
        if (backlog?.id) {
          const result = await updateServiceDefaultBacklogAction(
            { id: backlog.id, ...data },
            serviceId,
          );

          if (!result.success) {
            toast.error(result.message);
            return;
          }

          toast.success(t("toastUpdateSuccess"));
        } else {
          const result = await createServiceDefaultBacklogItemAction({
            ...data,
            serviceTypeId: serviceId,
          });

          if (!result.success) {
            toast.error(result.message);
            return;
          }

          toast.success(t("toastCreateSuccess"));
          form.reset();
        }

        handleCloseModal();
      } catch (error) {
        toast.error(t("toastUnexpectedError"));
        console.error(error);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Título */}
        <FormInput
          control={form.control}
          name="title"
          label={t("title")}
          placeholder={t("titlePlaceholder")}
          disabled={isPending}
        />

        {/* Linha: Status e Prioridade */}
        <div className="grid md:grid-cols-3 gap-2">
          <div className="md:col-span-2">
            <FormSelect
              control={form.control}
              name="priority"
              label={t("priority")}
              placeholder={t("priority")}
              options={getBacklogPriorityOptions((k) => tPriority(k as never))}
              disabled={isPending}
            />
          </div>
          <FormNumberInput
            control={form.control}
            name="points"
            label={t("storyPoints")}
            placeholder="0"
            min={0} // Evita números negativos
            step={1} // Garante inteiros se necessário
            disabled={isPending}
          />
        </div>

        {/* Descrição */}
        <FormTextarea
          label={t("description")}
          control={form.control}
          name="description"
          placeholder={t("descriptionPlaceholder")}
          className="resize-none min-h-[100px]"
          disabled={isPending}
        />

        <div className="w-full flex justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseModal}
            className="mr-2"
          >
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? tCommon("saving")
              : backlog?.id
                ? tCommon("actions.saveChanges")
                : t("createTask")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
