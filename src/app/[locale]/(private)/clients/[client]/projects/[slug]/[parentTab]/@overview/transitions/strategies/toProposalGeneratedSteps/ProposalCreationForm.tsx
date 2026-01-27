"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";

// Actions e Utils
import { fetchDocumentTemplatesAction } from "@/actions/templates/fetchDocumentTemplates";
import { createProposalAction } from "@/actions/proposal/createProposal";
import { date, date as day } from "@/lib/dayjs";
import { calculateItemFinalPrice } from "@/utils/calculateItemFinalPrice";
import { formatCurrency } from "@/utils/formatCurrency";
import { TransitionStrategyProps } from "../../types";
import { TemplateType } from "@/generated/prisma/enums";
import { FormRadioCards } from "@/components/form/FormRadioCards";
import { FormSelect } from "@/components/form/FormSelect";
import { FormNumberInput } from "@/components/form/FormNumberInput";
import { FormDatePicker } from "@/components/form/FormDatePicker";

// Seus Componentes Refatorados

type DocumentTemplates = {
  type: TemplateType;
  id: string;
  title: string;
};

const formSchema = z.object({
  mode: z.enum(["template", "upload"]),
  templateId: z.string().optional(),
  validUntil: z.date(),
  downPaymentPercentage: z.number({ error: "Obrigatório" }).min(0).max(100),
  items: z
    .array(
      z.object({
        serviceTypeId: z.string(),
        serviceName: z.string(),
        discountType: z.enum(["PERCENTAGE", "FIXED"]),
        discount: z.number().min(0),
        basePrice: z.number().optional(),
      }),
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProposalCreationForm({
  project,
  targetStatus,
  onSuccess,
  onCancel,
}: TransitionStrategyProps) {
  const [availableTemplates, setAvailableTemplates] = useState<
    DocumentTemplates[]
  >([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: "template",
      templateId: "",
      validUntil: day().add(7, "days").toDate(),
      downPaymentPercentage: 30,
      items: project.projectServices.map((s: any) => ({
        serviceTypeId: s.serviceTypeId,
        serviceName: s.serviceType.name,
        discountType: "PERCENTAGE",
        discount: 0,
        basePrice: s.serviceType.basePrice,
      })),
    },
  });

  const mode = form.watch("mode");
  const hasAvailableTemplate = availableTemplates.length > 0;

  // Carrega templates
  useEffect(() => {
    async function fetchAvailableTemplates() {
      const templates = await fetchDocumentTemplatesAction("PROPOSAL");
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

  // Cálculo Dinâmico de Valores
  const watchedItems = form.watch("items");
  const watchedDownPayment = form.watch("downPaymentPercentage");

  const calculatedTotal =
    watchedItems?.reduce((acc, item) => {
      const originalService = project.projectServices.find(
        (s: any) => s.serviceTypeId === item.serviceTypeId,
      );
      const basePrice = originalService?.serviceType?.basePrice || 0;
      return (
        acc + calculateItemFinalPrice({ ...item, price: Number(basePrice) })
      );
    }, 0) || 0;

  const downPaymentValue = calculatedTotal * (watchedDownPayment / 100);

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

      const itemsPayload =
        values.items?.map((item) => ({
          serviceTypeId: item.serviceTypeId,
          discountType: item.discountType,
          discount: item.discount,
        })) ?? [];

      formData.append("items", JSON.stringify(itemsPayload));
      formData.append("validUntil", values.validUntil.toISOString());
      formData.append(
        "downPaymentPercentage",
        String(values.downPaymentPercentage),
      );

      if (values.mode === "template" && values.templateId) {
        formData.append("documentTemplateId", values.templateId);
      } else if (file) {
        formData.append("document", file);
      }

      const result = await createProposalAction(formData);

      if (result?.error) {
        toast.error("Erro ao gerar proposta.");
        return;
      }
      // Sucesso
      if (onSuccess) onSuccess();
      else toast.success("Proposta criada com sucesso!");
    } catch (error: any) {
      if (error.message !== "NEXT_REDIRECT") {
        toast.error("Erro inesperado ao criar proposta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Seleção de Modo Visual */}
        <FormRadioCards
          control={form.control}
          name="mode"
          options={[
            {
              value: "template",
              label: "Gerar Automático",
              description: "Usar modelo padrão",
              disabled: !hasAvailableTemplate,
            },
            {
              value: "upload",
              label: "Upload PDF",
              description: "Enviar arquivo pronto",
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
            <div className="space-y-2 border border-dashed p-6 rounded-md bg-muted/20 flex flex-col items-center justify-center text-center">
              <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
              <Label
                htmlFor="file-upload"
                className="cursor-pointer text-primary hover:underline"
              >
                Clique para selecionar o PDF
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file && (
                <p className="text-sm font-medium text-green-600 mt-2">
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t mt-4">
            <FormNumberInput
              control={form.control}
              name="downPaymentPercentage"
              label="Percentual de Entrada"
              min={0}
              max={100}
              placeholder="30"
            />

            <FormDatePicker
              control={form.control}
              name="validUntil"
              label="Proposta Válida até"
              minDate={date().toDate()}
            />
          </div>

          {/* Lista de Itens / Serviços */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Serviços e Descontos
            </Label>
            <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 mt-2">
              {form.watch("items")?.map((item, index) => (
                <div
                  key={item.serviceTypeId}
                  className="grid grid-cols-12 gap-3 items-center border-b pb-3 last:border-0"
                >
                  <div className="col-span-5 flex flex-col justify-center">
                    <p
                      className="text-sm font-medium truncate"
                      title={item.serviceName}
                    >
                      {item.serviceName}
                    </p>
                    {item.basePrice && (
                      <span className="text-xs text-muted-foreground">
                        Base: {formatCurrency(item.basePrice)}
                      </span>
                    )}
                  </div>

                  <div className="col-span-4">
                    <FormSelect
                      control={form.control}
                      name={`items.${index}.discountType`}
                      label="Tipo"
                      // Pequeno hack para esconder o label visualmente mas manter acessibilidade se desejar
                      // ou você pode ajustar o FormSelect para aceitar labelClassName="sr-only"
                      options={[
                        { value: "PERCENTAGE", label: "%" },
                        { value: "FIXED", label: "R$" },
                      ]}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormNumberInput
                      control={form.control}
                      name={`items.${index}.discount`}
                      label="Valor"
                      placeholder="0"
                      min={0}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer com Totais */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t mt-6">
          <div className="flex flex-col items-start">
            <span className="text-sm text-muted-foreground font-medium">
              Valor Total da Proposta
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(calculatedTotal)}
              </span>
              <span className="text-sm text-muted-foreground italic">
                (Entrada: {formatCurrency(downPaymentValue)})
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 sm:flex-none"
              disabled={loading}
            >
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              {loading ? "Processando..." : "Gerar Proposta"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
