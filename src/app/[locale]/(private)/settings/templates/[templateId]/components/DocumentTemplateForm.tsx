"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TemplateType } from "@/generated/prisma/browser";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // ou seu hook de toast preferido

// UI Components (Shadcn UI assumed)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createDocumentTemplateAction } from "@/actions/templates/createDocumentTemplateAction";
import {
  createTemplateSchema,
  CreateTemplateSchemaType,
} from "@/schemas/documentTemplates/createDocumentTemplateSchema";
import Editor from "@/components/TipTap/Editor";
import { useRouter } from "next/navigation";

// Variáveis disponíveis
const VARIAVEIS_EXEMPLO = [
  { id: "cliente_nome", label: "Nome do Cliente" },
  { id: "cliente_cnpj", label: "CNPJ" },
  { id: "contrato_valor", label: "Valor do Contrato" },
  { id: "data_entrega", label: "Data de Entrega" },
];

interface DocumentTemplateFormProps {
  onSuccess?: () => void;
  // Se for edição, receberia initialData aqui
}

export function DocumentTemplateForm({ onSuccess }: DocumentTemplateFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<CreateTemplateSchemaType>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      title: "",
      type: TemplateType.CONTRACT, // Valor padrão
      content: "",
    },
  });

  const onSubmit = async (data: CreateTemplateSchemaType) => {
    setLoading(true);
    const result = await createDocumentTemplateAction(data);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Modelo salvo com sucesso!");
    form.reset();
    router.back();

    if (onSuccess) onSuccess();
  };

  // Mapeamento de Labels amigáveis para o Enum
  const typeLabels: Record<TemplateType, string> = {
    CONTRACT: "Contrato",
    PROPOSAL: "Proposta",
    DELIVERY_TERM: "Termo de Entrega",
    OTHER: "Outros",
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Grid para Título e Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Modelo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Contrato de Prestação de Serviços Padrão"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.keys(TemplateType).map((key) => (
                        <SelectItem key={key} value={key}>
                          {typeLabels[key as TemplateType]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Editor de Conteúdo */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo do Modelo</FormLabel>
              <FormControl>
                <Editor
                  variables={VARIAVEIS_EXEMPLO}
                  initialContent={field.value}
                  onChange={(newContent: any) => {
                    field.onChange(newContent);
                  }}
                />
              </FormControl>
              <FormDescription>
                Utilize as variáveis laterais para criar campos dinâmicos no
                documento.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Modelo
          </Button>
        </div>
      </form>
    </Form>
  );
}
