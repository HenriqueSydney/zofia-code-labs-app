"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ShieldCheck, Info } from "lucide-react";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { connectOrganizationIntegrationAction } from "@/actions/integrations/connectOrganizationIntegrationAction";
import { updateOrganizationIntegrationAction } from "@/actions/integrations/updateOrganizationIntegrationAction";
import { Integration } from "../page";
import { FormSecretInput } from "@/components/form/FormSecretInput";
import { FormSwitchCard } from "@/components/form/FormSwitchCard";

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

  const hints = integration.intergrationData?.metadata?.hints || {};

  // O formulário agora inclui o booleano de controle BYOL
  const form = useForm<Record<string, any>>({
    defaultValues: {
      enableByol: integration.enableByol
        ? (integration.orgIntegrationByol ?? false)
        : false,
      ...integration.fieldsSchema.reduce(
        (acc, field) => {
          acc[field.key] = "";
          return acc;
        },
        {} as Record<string, string>,
      ),
    },
  });

  const watchByol = form.watch("enableByol");

  // Lógica de Filtro:
  // Se a integração suportar BYOL e o switch estiver OFF, escondemos os campos que 'dependsOnByol'
  const visibleFields = watchByol
    ? integration.fieldsSchema // Mostra tudo para o cliente configurar
    : integration.fieldsSchema.filter(
        (f) => !f.dependsOnByol && !integration.enableByol,
      );

  const onSubmit = (values: Record<string, any>) => {
    const { enableByol, ...restValues } = values;

    // Filtramos apenas os campos que o usuário preencheu
    const secretValues = Object.fromEntries(
      Object.entries(restValues).filter(([_, value]) => value !== ""),
    );

    startTransition(async () => {
      const result = isUpdate
        ? await updateOrganizationIntegrationAction({
            id: integration.orgIntegrationId!,
            secretValues,
            enableByol, // Passamos o estado do switch para o backend
          })
        : await connectOrganizationIntegrationAction({
            integrationTypeId: integration.id,
            secretValues,
            enableByol,
          });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(isUpdate ? "Configurações atualizadas!" : "Conectado!");
      handleCloseModal();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Controle BYOL (Apenas se a integração permitir no catálogo) */}
        {integration.enableByol && (
          <FormSwitchCard
            control={form.control}
            name="enableByol"
            label="Trazer minha própria instância"
            description="Ative para usar sua própria infraestrutura e licença."
            icon={ShieldCheck}
            disabled={isPending}
          />
        )}

        {/* Alerta informativo se não for BYOL */}
        {integration.enableByol && !watchByol && visibleFields.length === 0 && (
          <>
            <div className="p-6 border rounded-xl bg-primary/5 border-primary/20 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-primary">
                  Instância Gerenciada Ativa
                </h4>
                <p className="text-xs text-muted-foreground max-w-[250px]">
                  Não é necessário configurar chaves. Cuidamos da
                  infraestrutura, segurança e atualizações para você.
                </p>
              </div>
            </div>
            <Alert className="bg-primary/5 border-primary py-3">
              <Info className="h-4 w-4 " />
              <AlertTitle className="font-bold">Modo Gerenciado</AlertTitle>
              <AlertDescription className="font-medium">
                Utilizaremos a infraestrutura padrão da Zofia Code Labs para
                este serviço (serviço sujeiro a cobranças).
              </AlertDescription>
            </Alert>
          </>
        )}

        {/* Renderização Dinâmica dos Campos */}
        <div className="space-y-4 transition-all duration-300">
          {visibleFields.map((field) => (
            <FormSecretInput
              key={field.key}
              control={form.control}
              name={field.key}
              label={field.label}
              hint={hints[field.key]}
              disabled={isPending}
              placeholder={
                hints[field.key]
                  ? "••••••••••••"
                  : `Insira o valor para ${field.label}`
              }
            />
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            type="button"
            onClick={handleCloseModal}
            disabled={isPending}
          >
            Cancelar
          </Button>
          {visibleFields.length > 0 && (
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Processando..."
                : isUpdate
                  ? "Salvar Alterações"
                  : "Conectar Serviço"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
