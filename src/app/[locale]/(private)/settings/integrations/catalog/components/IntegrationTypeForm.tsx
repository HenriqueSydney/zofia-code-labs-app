"use client";

import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Key, Type as TypeIcon } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  IntegrationTypeData,
  integrationTypeSchema,
} from "@/schemas/integration/integrationType";
import { createIntegrationTypeAction } from "@/actions/integrations/createIntegrationTypeAction";
import { updateIntegrationTypeAction } from "@/actions/integrations/updateIntegrationTypeAction";

interface IIntegrationFormProps {
  integration?: {
    id: string;
    name: string;
    logo?: string | null;
    description?: string | null;
    fieldsSchema?: any; // Array vindo do banco
  };
  handleCloseModal: () => void;
}

export function IntegrationTypeForm({
  integration,
  handleCloseModal,
}: IIntegrationFormProps) {
  const [isPending, startTransition] = useTransition();

  // Estados locais para o "Adicionador" de campos
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldKey, setNewFieldKey] = useState("");

  const form = useForm({
    resolver: zodResolver(integrationTypeSchema),
    defaultValues: {
      name: integration?.name ?? "",
      description: integration?.description ?? "",
      logo: integration?.logo ?? "",
      fieldsSchema: integration?.fieldsSchema ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fieldsSchema",
  });

  const logoUrl = form.watch("logo");

  // Função para adicionar novo campo à tabela
  const handleAddField = () => {
    if (!newFieldLabel || !newFieldKey) {
      toast.error("Preencha o Nome e a Chave do campo.");
      return;
    }

    // Verifica se a chave já existe para evitar duplicados
    const exists = fields.some((f) => f.key === newFieldKey);
    if (exists) {
      toast.error("Esta chave técnica já foi adicionada.");
      return;
    }

    append({
      label: newFieldLabel,
      key: newFieldKey.toLowerCase().replace(/\s+/g, "_"),
      type: "password",
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
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Integração</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Stripe"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Logo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
                        disabled={isPending}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {logoUrl && (
              <div className="w-10 h-10 rounded border bg-white flex items-center justify-center p-1">
                <img
                  src={logoUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="O que ela faz..."
                    className="resize-none"
                    rows={2}
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="externalDocsUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documentação Externa</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://..."
                    disabled={isPending}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- SEÇÃO BUILDER DE CAMPOS --- */}
        <div className="space-y-4 border-t pt-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Key className="w-4 h-4" /> Configuração de Campos (Infisical)
            </h3>
            <p className="text-xs text-muted-foreground">
              Defina quais chaves o cliente deverá preencher. Todos os valores
              serão tratados como secretos.
            </p>
          </div>

          {/* Input para Adicionar */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/30 rounded-lg border border-dashed">
            <div className="flex-1 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                Nome na UI
              </span>
              <Input
                placeholder="Ex: API Key"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                Chave Técnica
              </span>
              <Input
                placeholder="Ex: api_key"
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
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>

          {/* Tabela de Campos Adicionados */}
          {fields.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[10px]"></TableHead>
                    <TableHead>Rótulo (UI)</TableHead>
                    <TableHead>Chave (Infisical)</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((item, index) => (
                    <TableRow key={item.id} className="group">
                      <TableCell>
                        <TypeIcon className="w-3 h-3 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {item.label}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px]"
                        >
                          {item.key}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Salvando..."
              : integration
              ? "Atualizar Catálogo"
              : "Criar no Catálogo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
