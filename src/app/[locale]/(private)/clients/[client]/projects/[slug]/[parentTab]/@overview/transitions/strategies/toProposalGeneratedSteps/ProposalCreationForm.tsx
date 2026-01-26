import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TransitionStrategyProps } from "../../types";
import { changeProjectStatusAction } from "@/actions/projects/changeProjectStatus";
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
import { createProposalAction } from "@/actions/proposal/createProposal";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { date as day } from "@/lib/dayjs";
import { calculateItemFinalPrice } from "@/utils/calculateItemFinalPrice";
import { formatCurrency } from "@/utils/formatCurrency";
import { useRouter } from "next/navigation";

type DocumentTemplates = {
  type: TemplateType;
  id: string;
  title: string;
};

// Schema de validação
const formSchema = z.object({
  mode: z.enum(["template", "upload"]),
  templateId: z.string().optional(),
  validUntil: z.date(),
  downPaymentPercentage: z
    .number({
      error: "Percentual de entrada para início do projeto é obrigatório",
    })
    .positive({ error: "O percentual de entrada deve ser um número positivo" })
    .max(100, { error: "O valor máximo da entrada é 100%" }),
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
  // Inicializa o formulário com os serviços do projeto
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: "template",
      templateId: "",
      validUntil: day().add(7, "days").toDate(),
      downPaymentPercentage: 30,
      items: project.projectServices.map((s: any) => {
        return {
          serviceTypeId: s.serviceTypeId,
          serviceName: s.serviceType.name,
          discountType: "PERCENTAGE",
          discount: 0,
          basePrice: s.serviceType.basePrice,
        };
      }),
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
      // 3. Construção do FormData
      const formData = new FormData();

      // Campos obrigatórios base
      formData.append("projectId", project.id);

      // Opcional: validUntil (Se tiver um campo de data, adicione aqui. Exemplo com +30 dias)
      // const validUntil = addDays(new Date(), 30).toISOString();
      // formData.append("validUntil", validUntil);

      const itemsPayload =
        values.items?.map((item) => ({
          serviceTypeId: item.serviceTypeId,
          discountType: item.discountType,
          discount: item.discount,
        })) ?? [];

      formData.append("items", JSON.stringify(itemsPayload));

      if (values.mode === "template") {
        if (!values.templateId) {
          toast.error("Selecione um modelo de documento.");
          setLoading(false);
          return;
        }
        formData.append("documentTemplateId", values.templateId);

        // Items precisam ir como string JSON para o FormData processar arrays complexos
        // Filtramos items para garantir que enviamos apenas o necessário
      } else {
        // Modo Upload
        if (file) {
          formData.append("document", file);
        }
      }

      formData.append("validUntil", values.validUntil.toISOString());
      formData.append(
        "downPaymentPercentage",
        String(values.downPaymentPercentage),
      );

      // Chamada da Server Action com FormData
      const result = await createProposalAction(formData);

      if (result?.error) {
        toast.error("Erro ao gerar proposta.");
        return;
      }
    } catch (error: any) {
      if (error.message === "NEXT_REDIRECT") {
        return;
      }
      toast.error("Erro inesperado ao criar proposta.");
    } finally {
      setLoading(false);
    }
  };

  async function fetchAvailableTemplates() {
    const templates = await fetchDocumentTemplatesAction("PROPOSAL");

    if (templates.documentTemplates) {
      setAvailableTemplates(templates.documentTemplates as any);
      // Se tem templates, força o modo template, senão upload
      if (templates.totalOfRegisters > 0) {
        form.setValue("mode", "template");
      } else {
        form.setValue("mode", "upload");
      }
    }
  }

  useEffect(() => {
    fetchAvailableTemplates();
  }, []);

  const hasAvailableTemplate = availableTemplates.length > 0;

  const watchedItems = form.watch("items");
  const watchedDownPayment = form.watch("downPaymentPercentage");

  // Calcula o total dinamicamente
  const calculatedTotal =
    watchedItems?.reduce((acc, item) => {
      const originalService = project.projectServices.find(
        (s: any) => s.serviceTypeId === item.serviceTypeId,
      );

      const basePrice = originalService?.serviceType?.basePrice || 0;

      return (
        acc +
        calculateItemFinalPrice({
          ...item,
          price: Number(basePrice),
        })
      );
    }, 0) || 0;

  const downPaymentValue = calculatedTotal * (watchedDownPayment / 100);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 ">
        <FormField
          control={form.control}
          name="mode"
          render={({ field }) => (
            <FormItem>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
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
                    className="cursor-pointer flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Gerar Automático (Template)
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
                    className="cursor-pointer flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Upload de PDF Externo
                  </Label>
                </div>
              </RadioGroup>
            </FormItem>
          )}
        />
        <div className="space-y-4 border p-4 rounded-md">
          {mode === "template" ? (
            <>
              {/* Seleção do Template */}
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
            </>
          ) : (
            <div className="space-y-2 border p-4 rounded-md bg-muted/20">
              <Label>Anexar Proposta Elaborada</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t mt-4">
            {/* Campo: Percentual de Entrada */}
            <FormField
              control={form.control}
              name="downPaymentPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base  font-semibold">
                    Percentual de Entrada (%)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        %
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo: Proposta Válida até */}
            <FormField
              control={form.control}
              name="validUntil"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-base  font-semibold mb-2">
                    Proposta Válida até:
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            day(field.value).format("DD/MM/YYYY")
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() ||
                          date < new Date("1900-01-01") ||
                          date > day().add(15, "days").toDate()
                        }
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-3">
            <Label className="text-base font-semibold">Serviços</Label>
            <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 mt-2">
              {/* Itera sobre os items do array do formulário */}
              {form.watch("items")?.map((item, index) => (
                <div
                  key={item.serviceTypeId}
                  className="grid grid-cols-12 gap-2 items-center border-b pb-3 last:border-0"
                >
                  {/* Nome do Serviço */}
                  <div className="h-full col-span-5 flex flex-col justify-center">
                    <p
                      className="text-sm font-medium truncate"
                      title={item.serviceName}
                    >
                      {item.serviceName}
                    </p>
                    {item.basePrice && (
                      <span className="text-xs text-muted-foreground">
                        Valor base: {formatCurrency(item.basePrice)}
                      </span>
                    )}
                  </div>

                  {/* Tipo de Desconto */}
                  <div className="col-span-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.discountType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase text-muted-foreground">
                            Tipo Desc.
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PERCENTAGE">
                                Percentual (%)
                              </SelectItem>
                              <SelectItem value="FIXED">Fixo (R$)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Valor do Desconto (O NOVO CAMPO SOLICITADO) */}
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.discount`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase text-muted-foreground">
                            Valor
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="h-8"
                              placeholder="0"
                              min="0"
                              step="0.01"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(
                                  value === "" ? 0 : parseFloat(value),
                                );
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t mt-6">
          {/* Resumo de Valores */}
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

          {/* Botões de Ação */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 sm:flex-none"
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
