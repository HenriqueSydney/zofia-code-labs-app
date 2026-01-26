"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckedState } from "@radix-ui/react-checkbox";
import { toast } from "sonner";
import { Plus, Trash2, Key, ShieldCheck } from "lucide-react";

import { Form } from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import {
  IntegrationTypeData,
  integrationTypeSchema,
} from "@/schemas/integration/integrationType";
import { createIntegrationTypeAction } from "@/actions/integrations/createIntegrationTypeAction";
import { updateIntegrationTypeAction } from "@/actions/integrations/updateIntegrationTypeAction";
import { FormSwitchCard } from "@/components/form/FormSwitchCard";
import { FormInputSlug } from "@/components/form/FormInputSlug";
import { FormTextarea } from "@/components/form/FormTextarea";
import { FormInput } from "@/components/form/FormInput";

interface IIntegrationFormProps {
  integration?: {
    id: string;
    name: string;
    logo?: string | null;
    description?: string | null;
    enableByol?: boolean;
    fieldsSchema?: any;
    externalDocsUrl?: string | null;
  };
  handleCloseModal: () => void;
}

export function IntegrationTypeForm({
  integration,
  handleCloseModal,
}: IIntegrationFormProps) {
  const [isPending, startTransition] = useTransition();

  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldKey, setNewFieldKey] = useState("");

  const form = useForm({
    resolver: zodResolver(integrationTypeSchema),
    defaultValues: {
      name: integration?.name ?? "",
      description: integration?.description ?? "",
      logo: integration?.logo ?? "",
      enableByol: integration?.enableByol ?? false,
      externalDocsUrl: integration?.externalDocsUrl ?? "",
      fieldsSchema: integration?.fieldsSchema ?? [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "fieldsSchema",
  });

  const logoUrl = form.watch("logo");
  const isByolEnabled = form.watch("enableByol");

  const handleAddField = () => {
    if (!newFieldLabel || !newFieldKey) {
      toast.error("Preencha o Nome e a Chave do campo.");
      return;
    }

    const exists = fields.some((f) => f.key === newFieldKey);
    if (exists) {
      toast.error("Esta chave técnica já foi adicionada.");
      return;
    }

    append({
      label: newFieldLabel,
      key: newFieldKey.toUpperCase().replace(/\s+/g, "_"),
      type: "password",
      isSecret: true,
      required: true,
      dependsOnByol: false, // Default falso ao criar
    });

    setNewFieldLabel("");
    setNewFieldKey("");
  };

  const onSubmit = (data: IntegrationTypeData) => {
    startTransition(async () => {
      const action = integration
        ? () => updateIntegrationTypeAction({ ...data, id: integration.id })
        : () => createIntegrationTypeAction(data);

      const result = await action();

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(integration ? "Atualizado!" : "Criado!");
      handleCloseModal();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="grid grid-cols-1 gap-4">
            {/* ... Campos Nome, Logo, Descrição iguais ao anterior ... */}
            <FormInputSlug
              control={form.control}
              name="name"
              label="Nome da Integração"
              placeholder="Ex: Stripe"
              disabled={isPending}
            />

            <FormSwitchCard
              control={form.control}
              name="enableByol"
              label="Permite BYOL?"
              description=" Habilita o cliente a usar a própria instância/licença."
              icon={ShieldCheck}
              disabled={isPending}
            />

            {/* Logo e Descrição resumidos aqui para brevidade */}
            <FormTextarea
              control={form.control}
              name="description"
              label="Descrição"
              placeholder="O que ela faz..."
              rows={2}
              disabled={isPending}
            />
            <FormInput
              control={form.control}
              name="externalDocsUrl"
              label="Documentação Externa"
              type="url" // <--- O segredo está aqui
              placeholder="https://..."
              disabled={isPending}
            />
          </div>

          {/* --- SEÇÃO BUILDER DE CAMPOS --- */}
          <div className="space-y-4 lg:border-l lg:pl-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Key className="w-4 h-4" /> Configuração de Campos
              </h3>
              <p className="text-xs text-muted-foreground">
                Defina as chaves que serão armazenadas no Infisical.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/30 rounded-lg border border-dashed">
              <div className="flex-1 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Nome UI
                </span>
                <Input
                  placeholder="Ex: API Key"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Chave
                </span>
                <Input
                  placeholder="Ex: API_KEY"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddField}
                className="sm:self-end"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {fields.length > 0 && (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-[11px]">Rótulo</TableHead>
                      <TableHead className="text-[11px]">Chave</TableHead>
                      {isByolEnabled && (
                        <TableHead className="text-[11px] text-center w-[80px]">
                          BYOL?
                        </TableHead>
                      )}
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((item, index) => (
                      <TableRow key={item.id} className="group">
                        <TableCell className="py-2 text-sm">
                          {item.label}
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px] uppercase"
                          >
                            {item.key}
                          </Badge>
                        </TableCell>

                        {isByolEnabled && (
                          <TableCell className="py-2 text-center">
                            <Checkbox
                              checked={item.dependsOnByol}
                              onCheckedChange={(checked: CheckedState) => {
                                update(index, {
                                  ...item,
                                  dependsOnByol: !!checked,
                                });
                              }}
                            />
                          </TableCell>
                        )}

                        <TableCell className="py-2 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* ... Botões de Ação Cancelar/Salvar ... */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            type="button"
            onClick={handleCloseModal}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar no Catálogo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
