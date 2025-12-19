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

type DocumentTemplates = {
  type: TemplateType;
  id: string;
  title: string;
};

// Schema de validação
const formSchema = z.object({
  mode: z.enum(["template", "upload"]),
  templateId: z.string().optional(),
  items: z
    .array(
      z.object({
        serviceTypeId: z.string(),
        serviceName: z.string(),
        discountType: z.enum(["PERCENTAGE", "FIXED"]),
        discount: z.number().min(0),
      })
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
  // Inicializa o formulário com os serviços do projeto
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: "template",
      templateId: "",
      items: project.projectServices.map((s: any) => {
        return {
          serviceTypeId: s.serviceTypeId,
          serviceName: s.serviceType.name,
          discountType: "PERCENTAGE",
          discount: 0,
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

      if (values.mode === "template") {
        if (!values.templateId) {
          toast.error("Selecione um modelo de documento.");
          setLoading(false);
          return;
        }
        formData.append("documentTemplateId", values.templateId);

        // Items precisam ir como string JSON para o FormData processar arrays complexos
        // Filtramos items para garantir que enviamos apenas o necessário
        const itemsPayload =
          values.items?.map((item) => ({
            serviceTypeId: item.serviceTypeId,
            discountType: item.discountType,
            discount: item.discount,
          })) ?? [];

        formData.append("items", JSON.stringify(itemsPayload));
      } else {
        // Modo Upload
        if (file) {
          formData.append("document", file);
        }
      }

      // Chamada da Server Action com FormData
      const result = await createProposalAction(formData);

      if (!result) {
        onSuccess();
        return;
      } else {
        toast.error("Erro ao gerar proposta.");
      }
    } catch (error) {
      console.error(error);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

        {mode === "template" ? (
          <div className="space-y-4 border p-4 rounded-md">
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

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Configuração de Serviços
              </Label>
              <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 mt-2">
                {/* Itera sobre os items do array do formulário */}
                {form.watch("items")?.map((item, index) => (
                  <div
                    key={item.serviceTypeId}
                    className="grid grid-cols-12 gap-2 items-end border-b pb-3 last:border-0"
                  >
                    {/* Nome do Serviço */}
                    <div className="h-full col-span-5 flex flex-col justify-between">
                      <Label className="text-xs text-muted-foreground">
                        Serviço
                      </Label>
                      <p
                        className="text-sm font-medium mb-1 truncate"
                        title={item.serviceName}
                      >
                        {item.serviceName}
                      </p>
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
                                    value === "" ? 0 : parseFloat(value)
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

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Voltar
          </Button>
          <Button type="submit" disabled={loading}>
            Gerar Proposta
          </Button>
        </div>
      </form>
    </Form>
  );
}
