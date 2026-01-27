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
const toProposalSchema = z.object({
  observation: z.string().min(10, "Informe uma observação técnica detalhada."),
  serviceIds: z.array(z.string()).min(1, "Selecione pelo menos um serviço."),
});

type FormValues = z.infer<typeof toProposalSchema>;

export function ToProposal({
  project,
  targetStatus,
  onSuccess,
  onCancel,
  contextData,
}: TransitionStrategyProps) {
  const [isPending, startTransition] = useTransition();

  // Tipagem segura para os serviços vindos do contextData
  // Supondo que contextData seja um array de { id, name, ... }
  const availableServices = (contextData as any[]) || [];

  // IDs iniciais já vinculados ao projeto
  const initialServiceIds = project.projectServices.map(
    (service) => service.serviceTypeId,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(toProposalSchema),
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
          toast.success("Projeto encaminhado para proposta!");
          onSuccess();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("Erro inesperado ao processar solicitação.");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-1">
          <h3 className="font-medium">Definição Técnica</h3>
          <p className="text-sm text-muted-foreground">
            Revise os serviços e adicione o parecer técnico para a equipe
            comercial.
          </p>
        </div>

        {/* Campo Serviços (Refatorado) */}
        <FormMultiCheckbox
          control={form.control}
          name="serviceIds"
          label="Serviços Necessários"
          description="Selecione os serviços que comporão o escopo desta proposta."
          disabled={isPending}
          className="grid-cols-1 md:grid-cols-2" // Customizando o grid do componente
          options={availableServices.map((s) => ({
            id: s.id,
            label: s.name,
          }))}
        />

        {/* Campo Observação (Refatorado) */}
        <FormTextarea
          control={form.control}
          name="observation"
          label="Parecer Técnico"
          placeholder="Descreva detalhes técnicos, complexidade estimada e requisitos específicos..."
          rows={4}
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
            Encaminhar para Proposta
          </Button>
        </div>
      </form>
    </Form>
  );
}
