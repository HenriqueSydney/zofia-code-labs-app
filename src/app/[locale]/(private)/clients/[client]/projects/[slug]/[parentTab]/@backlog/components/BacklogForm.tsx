"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

// Schemas e Actions
import {
  BacklogItemSchema,
  backlogItemSchema,
  BacklogStatusEnum,
  BacklogPriorityEnum,
} from "@/schemas/backlog/backlogItemSchema";
import { updateBacklogAction } from "@/actions/backlog/updateBacklogItemAction";
import { createBacklogAction } from "@/actions/backlog/createBacklogItemAction";
import { listUsersByOrganizationAction } from "@/actions/users/listUsersByOrganizationAction";
import {
  getBacklogPriorityOptions,
  getBacklogStatusOptions,
} from "@/mappers/BacklogMappers";
import { FormInput } from "@/components/form/FormInput";
import { FormSelect } from "@/components/form/FormSelect";
import { FormNumberInput } from "@/components/form/FormNumberInput";
import { FormTextarea } from "@/components/form/FormTextarea";
import { useTranslations } from "next-intl";

export type AssigneeOption = {
  id: string;
  name: string | null;
  email?: string;
};

interface IBacklogForm {
  projectId: string;
  backlog?: BacklogItemSchema;
  handleCloseModal: () => void;
}

// Mapeamento das opções estáticas para o formato { label, value }

export function BacklogForm({
  projectId,
  backlog,
  handleCloseModal,
}: IBacklogForm) {
  const t = useTranslations("projects.backlog.form");
  const tStatus = useTranslations("projects.backlog.status");
  const tPriority = useTranslations("projects.backlog.priorityLabels");
  const tCommon = useTranslations("common");
  const tActions = useTranslations("common.actions");

  const STATUS_OPTIONS = getBacklogStatusOptions(
    (key) => tStatus(key as never),
  );
  const PRIORITY_OPTIONS = getBacklogPriorityOptions(
    (key) => tPriority(key as never),
  );
  const { data: session } = useSession();
  const params = useParams();
  const [assigneesOptions, setAssigneesOptions] = useState<AssigneeOption[]>(
    [],
  );
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(backlogItemSchema),
    defaultValues: {
      id: backlog?.id,
      title: backlog?.title ?? "",
      description: backlog?.description ?? "",
      status: backlog?.status ?? "TODO",
      priority: backlog?.priority ?? "LOW",
      points: backlog?.points ?? 0,
      externalLink: backlog?.externalLink ?? "",
      // Truque para o Select funcionar bem: se for null, usa string "unassigned" no formulário
      assigneeId: backlog?.assigneeId ?? "unassigned",
      projectId,
    },
  });

  // Busca usuários para o Select de Responsável
  useEffect(() => {
    async function populateAssignOptions() {
      if (!session) return;
      const orgUsers = await listUsersByOrganizationAction(
        session.user.organizationId,
      );

      if (orgUsers.success) {
        setAssigneesOptions(orgUsers.data.users);
      }
    }
    populateAssignOptions();
  }, [session]);

  const onSubmit = (data: any) => {
    // Tratamento reverso do Assignee: Se for "unassigned", vira null para o backend
    const payload = {
      ...data,
      assigneeId: data.assigneeId === "unassigned" ? null : data.assigneeId,
    };

    startTransition(async () => {
      try {
        if (backlog?.id) {
          const result = await updateBacklogAction(
            payload,
            params.slug as string,
          );
          if (!result.success) {
            toast.error(result.message);
            return;
          }
          toast.success(t("toastUpdated"));
        } else {
          const result = await createBacklogAction(
            { ...payload, projectId },
            params.slug as string,
          );
          if (!result.success) {
            toast.error(result.message);
            return;
          }
          toast.success(t("toastCreated"));
          form.reset();
        }
        handleCloseModal();
      } catch (error) {
        toast.error(t("toastUnexpectedError"));
        console.error(error);
      }
    });
  };

  // Prepara as opções de usuários para o FormSelect
  const userOptions = [
    { value: "unassigned", label: t("unassigned") },
    ...assigneesOptions.map((u) => ({
      value: u.id,
      label: u.name ?? t("noName"),
    })),
  ];

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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <FormSelect
              control={form.control}
              name="status"
              label={t("statusLabel")}
              placeholder={tCommon("select")}
              options={STATUS_OPTIONS}
              disabled={isPending}
            />
          </div>

          <div className="flex-1">
            <FormSelect
              control={form.control}
              name="priority"
              label={t("priorityLabel")}
              placeholder={tCommon("select")}
              options={PRIORITY_OPTIONS}
              disabled={isPending}
            />
          </div>
        </div>

        {/* Linha: Pontos e Responsável */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-32">
            <FormNumberInput
              control={form.control}
              name="points"
              label={t("storyPoints")}
              placeholder="0"
              min={0}
              disabled={isPending}
            />
          </div>

          <div className="flex-1">
            <FormSelect
              control={form.control}
              name="assigneeId"
              label={t("assignee")}
              placeholder={t("assigneePlaceholder")}
              options={userOptions}
              disabled={isPending}
            />
          </div>
        </div>

        {/* Descrição */}
        <FormTextarea
          control={form.control}
          name="description"
          label={t("description")}
          placeholder={t("descriptionPlaceholder")}
          rows={5}
          disabled={isPending}
        />

        {/* Link Externo */}
        <FormInput
          control={form.control}
          name="externalLink"
          type="url"
          label={t("externalLinkLabel")}
          description={t("externalLinkDescription")}
          placeholder="https://..."
          disabled={isPending}
        />

        <div className="w-full flex justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCloseModal}
            className="mr-2"
            disabled={isPending}
          >
            {tActions("cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? tCommon("saving")
              : backlog?.id
                ? tActions("saveChanges")
                : t("createTask")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
