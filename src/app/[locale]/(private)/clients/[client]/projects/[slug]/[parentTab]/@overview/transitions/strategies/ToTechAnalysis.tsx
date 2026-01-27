"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TransitionStrategyProps } from "../types";
import { changeProjectStatusAction } from "@/actions/projects/changeProjectStatus";
import { FormMultiCheckbox } from "@/components/form/FormMultiCheckbox";
import { FormTextarea } from "@/components/form/FormTextarea";

// Componentes Refatorados

// Schema
const toTechAnalysisSchema = z.object({
  observation: z.string().min(10, "Informe uma observação técnica detalhada."),
  serviceIds: z.array(z.string()).min(1, "Selecione pelo menos um serviço."),
});

type FormValues = z.infer<typeof toTechAnalysisSchema>;

export function ToTechAnalysis({
  project,
  targetStatus,
  onSuccess,
  onCancel,
  contextData,
}: TransitionStrategyProps) {
  const [isPending, startTransition] = useTransition();

  // Tratamento dos dados de contexto (Lista de serviços disponíveis)
  const availableServices = (contextData as any[]) || [];

  // IDs dos serviços que o projeto JÁ possui
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
          toast.success("Projeto enviado para análise técnica!");
          onSuccess();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("Erro inesperado ao processar a solicitação.");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1">
          <h3 className="font-medium">Solicitação de Análise</h3>
          <p className="text-sm text-muted-foreground">
            Defina o escopo preliminar e envie as instruções para o time
            técnico.
          </p>
        </div>

        {/* Componente de Checkbox Múltiplo Refatorado */}
        <FormMultiCheckbox
          control={form.control}
          name="serviceIds"
          label="Análise preliminar de serviços"
          description="Indique quais serviços devem ser avaliados pelo time técnico."
          disabled={isPending}
          className="grid-cols-1 md:grid-cols-2"
          options={availableServices.map((s) => ({
            id: s.id,
            label: s.name,
          }))}
        />

        {/* Componente de Textarea Refatorado */}
        <FormTextarea
          control={form.control}
          name="observation"
          label="Instruções para a Equipe Técnica"
          placeholder="Descreva o que deve ser analisado, dúvidas específicas ou requisitos do cliente..."
          rows={5}
          disabled={isPending}
        />

        {/* Footer com Ações */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Encaminhar para Técnica
          </Button>
        </div>
      </form>
    </Form>
  );
}
