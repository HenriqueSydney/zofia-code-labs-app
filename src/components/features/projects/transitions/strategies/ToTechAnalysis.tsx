import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TransitionStrategyProps } from "../types";
import { changeProjectStatusAction } from "@/actions/projects/changeProjectStatus";

// Schema de validação específico desta etapa
const toTechAnalysis = z.object({
  observation: z.string().min(10, "Informe uma observação técnica detalhada."),
  serviceIds: z.array(z.string()).min(1, "Selecione pelo menos um serviço."),
});

type FormValues = z.infer<typeof toTechAnalysis>;

export function ToTechAnalysis({
  project,
  targetStatus,
  onSuccess,
  onCancel,
  contextData,
}: TransitionStrategyProps) {
  // Supondo que contextData venha com a lista de services (fetch feito pelo componente pai ou server component)
  const availableServices = contextData || [];

  const servicesIds = project.projectServices.map(
    (service) => service.serviceTypeId
  );

  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(toTechAnalysis),
    defaultValues: { observation: "", serviceIds: servicesIds },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    // Aqui passamos os dados extras (services e obs) para a Server Action
    const result = await changeProjectStatusAction({
      projectId: project.id,
      newStatus: targetStatus,
      data,
    });
    setLoading(false);

    if (result.success) onSuccess();
    else alert(result.error);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Campo Observação */}
        <FormField
          control={form.control}
          name="observation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação/Análise para equipe técnica</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os detalhes técnicos para a proposta..."
                  className="h-50"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Serviços (Checkboxes) */}
        <FormField
          control={form.control}
          name="serviceIds"
          render={() => (
            <FormItem>
              <FormLabel className="mb-2 mt-4 block">
                Análise preliminar de serviços necessários
              </FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-100 overflow-y-auto p-2 rounded">
                {availableServices.map((service: any) => (
                  <FormField
                    key={service.id}
                    control={form.control}
                    name="serviceIds"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={service.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(service.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, service.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== service.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {service.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            Encaminhar para equipe técnica
          </Button>
        </div>
      </form>
    </Form>
  );
}
