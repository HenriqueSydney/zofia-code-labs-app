"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

// Actions e Types
import { fetchDocumentTemplatesAction } from "@/actions/templates/fetchDocumentTemplates";
import { createContractAction } from "@/actions/contract/createContract";
import { TemplateType } from "@/generated/prisma/enums";
import { TransitionStrategyProps } from "../../types";
import { FormRadioCards } from "@/components/form/FormRadioCards";
import { FormSelect } from "@/components/form/FormSelect";

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
  const hasAvailableTemplate = availableTemplates.length > 0;

  // Carrega templates ao montar
  useEffect(() => {
    async function fetchAvailableTemplates() {
      const templates = await fetchDocumentTemplatesAction("CONTRACT");
      if (templates.documentTemplates) {
        setAvailableTemplates(templates.documentTemplates as any);
        // Define o modo padrão com base na disponibilidade
        form.setValue(
          "mode",
          templates.totalOfRegisters > 0 ? "template" : "upload",
        );
      }
    }
    fetchAvailableTemplates();
  }, [form]);

  const handleSubmit = async (values: FormValues) => {
    if (values.mode === "upload" && !file) {
      toast.error("Selecione um arquivo PDF.");
      return;
    }

    if (values.mode === "template" && !values.templateId) {
      toast.error("Selecione um modelo de documento.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("projectId", project.id);

      if (values.mode === "template") {
        formData.append("documentTemplateId", values.templateId!);
      } else if (file) {
        formData.append("document", file);
      }

      const result = await createContractAction(formData);

      if (result?.error) {
        toast.error("Erro ao gerar contrato.");
      }
      // O redirect acontece no Server Action ou componente pai lida com sucesso
    } catch (error: any) {
      if (error.message !== "NEXT_REDIRECT") {
        toast.error("Erro inesperado ao criar contrato.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium leading-none">
          Configuração do Contrato
        </h3>
        <p className="text-sm text-muted-foreground">
          Defina como o contrato jurídico deste projeto será gerado.
        </p>
        <Separator className="my-4" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Seleção de Modo via Cards */}
          <FormRadioCards
            control={form.control}
            name="mode"
            options={[
              {
                value: "template",
                label: "Gerar via Template",
                description: "Usar modelo padrão do sistema",
                disabled: !hasAvailableTemplate,
              },
              {
                value: "upload",
                label: "Upload de PDF",
                description: "Anexar contrato assinado/pronto",
              },
            ]}
          />

          <div className="space-y-4 border p-4 rounded-md bg-card">
            {mode === "template" ? (
              <FormSelect
                control={form.control}
                name="templateId"
                label="Modelo de Documento"
                placeholder="Selecione o template..."
                options={availableTemplates.map((t) => ({
                  value: t.id,
                  label: t.title,
                }))}
              />
            ) : (
              // Área de Upload Manual (Visual Clean)
              <div className="space-y-2 border-2 border-dashed border-muted-foreground/25 p-6 rounded-md bg-muted/5 hover:bg-muted/10 transition-colors flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-muted rounded-full mb-2">
                  {file ? (
                    <FileText className="h-6 w-6 text-primary" />
                  ) : (
                    <UploadCloud className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                <Label
                  htmlFor="contract-upload"
                  className="cursor-pointer text-sm font-medium"
                >
                  {file ? (
                    <span className="text-green-600 font-semibold">
                      {file.name}
                    </span>
                  ) : (
                    <>
                      <span className="text-primary hover:underline">
                        Clique para selecionar
                      </span>{" "}
                      ou arraste o PDF
                    </>
                  )}
                </Label>

                <Input
                  id="contract-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                {!file && (
                  <p className="text-xs text-muted-foreground">
                    O arquivo será vinculado diretamente ao projeto.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="px-6">
              {loading ? "Processando..." : "Gerar Contrato"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
