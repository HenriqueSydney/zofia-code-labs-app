"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { connectOrganizationIntegrationAction } from "@/actions/integrations/connectOrganizationIntegrationAction";
import { updateOrganizationIntegrationAction } from "@/actions/integrations/updateOrganizationIntegrationAction";
import { Integration } from "../page";

interface IConnectIntegrationFormProps {
  integration: Integration;
  handleCloseModal: () => void;
}

export function IntegrationConfigForm({
  integration,
  handleCloseModal,
}: IConnectIntegrationFormProps) {
  const [isPending, startTransition] = useTransition();
  const isUpdate = !!integration.orgIntegrationId;

  // Pegamos os hints que salvamos no UseCase de Create
  const hints = integration.intergrationData?.metadata?.hints || {};

  const form = useForm<Record<string, string>>({
    defaultValues: integration.fieldsSchema.reduce((acc, field) => {
      acc[field.key] = ""; // Mantemos vazio para forçar o usuário a digitar se quiser mudar
      return acc;
    }, {} as Record<string, string>),
  });

  const onSubmit = (values: Record<string, string>) => {
    // Filtramos apenas os campos que o usuário preencheu (suporte a update parcial)
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([_, value]) => value !== "")
    );

    if (isUpdate && Object.keys(filteredValues).length === 0) {
      toast.info("Nenhuma alteração detectada.");
      handleCloseModal();
      return;
    }

    startTransition(async () => {
      const result = isUpdate
        ? await updateOrganizationIntegrationAction({
            id: integration.orgIntegrationId!,
            secretValues: filteredValues,
          })
        : await connectOrganizationIntegrationAction({
            integrationTypeId: integration.id,
            secretValues: filteredValues,
          });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(
        isUpdate
          ? "Configurações atualizadas!"
          : `${integration.name} conectado com sucesso!`
      );
      handleCloseModal();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {integration.fieldsSchema.map((field) => (
          <FormField
            key={field.key}
            control={form.control}
            name={field.key}
            render={({ field: inputField }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>{field.label}</FormLabel>
                  {hints[field.key] && (
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 rounded">
                      Atual: {hints[field.key]}
                    </span>
                  )}
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={
                      hints[field.key]
                        ? "Deixe em branco para manter o atual"
                        : `Insira o ${field.label}`
                    }
                    disabled={isPending}
                    {...inputField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" type="button" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Processando..."
              : isUpdate
              ? "Salvar Alterações"
              : "Conectar Serviço"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
