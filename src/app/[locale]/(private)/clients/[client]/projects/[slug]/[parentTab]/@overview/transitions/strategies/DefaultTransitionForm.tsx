"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { changeProjectStatusAction } from "@/actions/projects/changeProjectStatus";
import { TransitionStrategyProps } from "../types";
import { FormTextarea } from "@/components/form/FormTextarea";
import { useTranslations } from "next-intl";

// Schema de validação
const transitionSchema = z.object({
  observation: z.string().optional(),
});

type TransitionFormValues = z.infer<typeof transitionSchema>;

export function DefaultTransitionForm({
  project,
  targetStatus,
  onSuccess,
  onCancel,
  contextData,
}: TransitionStrategyProps) {
  const t = useTranslations("projects.transitions");
  const tCommon = useTranslations("projects.transitions.common");
  const tErrors = useTranslations("common.errors");
  const [isPending, startTransition] = useTransition();

  const form = useForm<TransitionFormValues>({
    resolver: zodResolver(transitionSchema),
    defaultValues: {
      observation: "",
    },
  });

  const onSubmit = (data: TransitionFormValues) => {
    startTransition(async () => {
      try {
        const result = await changeProjectStatusAction({
          projectId: project.id,
          newStatus: targetStatus,
          data: {
            observation: data.observation?.trim(),
          },
        });

        if (result.success) {
          toast.success(t("statusUpdated"));
          onSuccess();
        } else {
          toast.error(result.error || tErrors("statusUpdate"));
        }
      } catch (error) {
        toast.error(tCommon("errors.unexpected"));
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Banner Informativo */}
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border border-border/50">
          <p>{t("confirmAdvance")}</p>
          {contextData?.targetLabel && (
            <p className="mt-1">
              {t("newStatusWillBe")}{" "}
              <strong className="text-primary font-semibold">
                {contextData.targetLabel}
              </strong>
            </p>
          )}
        </div>

        {/* Campo de Observação usando seu componente */}
        <FormTextarea
          control={form.control}
          name="observation"
          label={t("observations")}
          placeholder={t("observationsPlaceholder")}
          rows={3}
          disabled={isPending}
        />

        {/* Botões de Ação */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="w-full sm:w-auto mt-2 sm:mt-0"
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("confirmButton")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
