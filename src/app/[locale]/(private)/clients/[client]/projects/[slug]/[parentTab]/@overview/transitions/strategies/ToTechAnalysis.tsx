"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TransitionStrategyProps } from "../types";
import { changeProjectStatusAction } from "@/actions/projects/changeProjectStatus";
import { FormMultiCheckbox } from "@/components/form/FormMultiCheckbox";
import { FormTextarea } from "@/components/form/FormTextarea";

const createToTechAnalysisSchema = (
  observationMin: string,
  selectService: string,
) =>
  z.object({
    observation: z.string().min(10, observationMin),
    serviceIds: z.array(z.string()).min(1, selectService),
  });

type FormValues = z.infer<ReturnType<typeof createToTechAnalysisSchema>>;

export function ToTechAnalysis({
  project,
  targetStatus,
  onSuccess,
  onCancel,
  contextData,
}: TransitionStrategyProps) {
  const t = useTranslations("projects.transitions.toTechAnalysis");
  const tCommon = useTranslations("projects.transitions.common");
  const [isPending, startTransition] = useTransition();

  const toTechAnalysisSchema = createToTechAnalysisSchema(
    t("validation.observationMin"),
    tCommon("validation.selectAtLeastOneService"),
  );

  const availableServices = (contextData as any[]) || [];

  const initialServiceIds = project.projectServices.map(
    (service) => service.serviceTypeId,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(toTechAnalysisSchema),
    defaultValues: {
      observation: "",
      serviceIds: initialServiceIds,
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        const result = await changeProjectStatusAction({
          projectId: project.id,
          newStatus: targetStatus,
          data,
        });

        if (result.success) {
          toast.success(t("toast.success"));
          onSuccess();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error(tCommon("errors.unexpected"));
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1">
          <h3 className="font-medium">{t("title")}</h3>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>

        <FormMultiCheckbox
          control={form.control}
          name="serviceIds"
          label={t("fields.services.label")}
          description={t("fields.services.description")}
          disabled={isPending}
          className="grid-cols-1 md:grid-cols-2"
          options={availableServices.map((s) => ({
            id: s.id,
            label: s.name,
          }))}
        />

        <FormTextarea
          control={form.control}
          name="observation"
          label={t("fields.observation.label")}
          placeholder={t("fields.observation.placeholder")}
          rows={5}
          disabled={isPending}
        />

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
