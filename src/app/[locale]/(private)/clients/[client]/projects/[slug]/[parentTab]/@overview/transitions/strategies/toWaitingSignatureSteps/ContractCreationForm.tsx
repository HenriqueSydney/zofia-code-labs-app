"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TransitionStrategyProps } from "../../types";
import {
  Form,
  FormControl,
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
import { fetchDocumentTemplatesAction } from "@/actions/templates/fetchDocumentTemplates";
import { TemplateType } from "@/generated/prisma/enums";
import { toast } from "sonner";
import { createContractAction } from "@/actions/contract/createContract";
import { ProposalDetails } from "@/components/ProposalDetail";
import { Separator } from "@/components/ui/separator";

type DocumentTemplates = {
  type: TemplateType;
  id: string;
  title: string;
};

const formSchema = z.object({
  mode: z.enum(["template", "upload"]),
  templateId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ContractCreationForm({
  project,
  onCancel,
  contextData,
}: Omit<TransitionStrategyProps, "onSuccess">) {
  const [availableTemplates, setAvailableTemplates] = useState<
    DocumentTemplates[]
  >([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: "template",
      templateId: "",
    },
  });

  const mode = form.watch("mode");

  const handleSubmit = async (values: FormValues) => {
    if (values.mode === "upload" && !file) {
      toast.error("Selecione um arquivo PDF.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("projectId", project.id);

      if (values.mode === "template") {
        if (!values.templateId) {
          toast.error("Selecione um modelo de documento.");
          setLoading(false);
          return;
        }
        formData.append("documentTemplateId", values.templateId);
      } else if (file) {
        formData.append("document", file);
      }

      const result = await createContractAction(formData);
      if (result?.error) {
        toast.error("Erro ao gerar proposta.");
      }
    } catch (error: any) {
      if (error.message === "NEXT_REDIRECT") {
        return;
      }
      toast.error("Erro inesperado ao criar contrato.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchAvailableTemplates() {
      const templates = await fetchDocumentTemplatesAction("CONTRACT");
      if (templates.documentTemplates) {
        setAvailableTemplates(templates.documentTemplates as any);
        form.setValue(
          "mode",
          templates.totalOfRegisters > 0 ? "template" : "upload",
        );
      }
    }
    fetchAvailableTemplates();
  }, [form]);

  const hasAvailableTemplate = availableTemplates.length > 0;

  return (
    <div className="space-y-6">
      <div className="h-10 space-y-4 mb-6">
        <h3 className="text-lg font-medium">Configuração do Contrato</h3>
        <Separator />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="template"
                      disabled={!hasAvailableTemplate}
                      id="template"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="template"
                      className="cursor-pointer flex flex-col items-center justify-center text-center h-20 rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    >
                      <span className="font-semibold text-sm">
                        Gerar via Template
                      </span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="upload"
                      id="upload"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="upload"
                      className="cursor-pointer flex flex-col items-center justify-center text-center h-20 rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    >
                      <span className="font-semibold text-sm">
                        Upload de PDF
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </FormItem>
            )}
          />

          {mode === "template" ? (
            <div className="space-y-4 border p-4 rounded-md shadow-sm">
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo de Documento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <div className="space-y-3 border p-6 rounded-md bg-muted/20 border-dashed">
              <Label>Documento PDF do Contrato</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-[10px] text-muted-foreground">
                O arquivo será vinculado diretamente ao projeto.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 mr-4">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="px-8">
              {loading ? "Processando..." : "Gerar Contrato"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
