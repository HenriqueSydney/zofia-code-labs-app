"use client";

import { useState } from "react";
import { FileText, Eye, Send, ThumbsUp, EyeClosed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProposalDetails } from "@/components/ProposalDetail";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "@/i18n/navigation";
import { date } from "@/lib/dayjs";
import { AttachmentIcon } from "@/components/AttachmentIcon";
import { changeContractStatusAction } from "@/actions/contract/changeContractStatus";
import { toast } from "sonner";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { getContractDownloadUrl } from "@/actions/contract/getContractDownloadUrl";
import { Tooltip } from "@/components/Tooltip";

// Schema atualizado para refletir as opções do rádio
const toClientSchema = z.object({
  communicationChannel: z.enum(["email", "whatsapp"], {
    error: "Selecione um canal de comunicação",
  }),
});

type FormValues = z.infer<typeof toClientSchema>;

interface ContractSendToClientProps {
  contract: ContractWithDetails;
  onSuccess: () => void;
  onBack?: () => void;
}

export function ContractSendToClient({
  contract,
  onSuccess,
}: ContractSendToClientProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(toClientSchema),
    defaultValues: {
      communicationChannel: "email",
    },
  });

  // Função disparada no submit do formulário
  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      // Aqui você pode passar o data.communicationChannel para sua action se necessário
      const result = await changeContractStatusAction(
        contract.id,
        "SENT",
        data.communicationChannel
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        `Contrato enviada via ${data.communicationChannel} com sucesso!`
      );
      onSuccess();
    } catch (error) {
      toast.error("Erro inesperado ao encaminhar a contrato ao cliente.");
    } finally {
      setLoading(false);
    }
  };

  const isTemplate = contract.sourceType === "SYSTEM_TEMPLATE";

  const communicationChannels = [
    { id: "email", label: "E-mail" },
    { id: "whatsapp", label: "WhatsApp" },
  ];

  const selectedChannel = form.watch("communicationChannel");

  const handleDownload = async (id: string) => {
    const result = await getContractDownloadUrl(id);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    const { url } = result;

    // Abre em nova aba ou inicia download
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cabeçalho de Status */}
      <Alert className="bg-green-800/10 border-green-300/30">
        <ThumbsUp className="h-4 w-4" />
        <AlertTitle>Contrato Pronto para Envio</AlertTitle>
        <AlertDescription>
          Selecione o canal abaixo para notificar o cliente.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="">
          {/* Coluna Lateral - Configuração de Envio */}
          <div className="flex flex-col space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Documento Gerado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <strong>Origem:</strong>
                  <span>
                    {isTemplate ? "Modelo de Documento" : "Upload de arquivo"}
                  </span>
                </div>
                <Separator />
                <Link href={contract.fileUrl ?? ""} target="_blank">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <AttachmentIcon extension="pdf" />
                      <div>
                        <p className="text-sm font-medium line-clamp-1">
                          Visualizar PDF
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {date(contract.createdAt).format("DD/MM/YYYY")}
                        </p>
                      </div>
                    </div>
                    <Tooltip
                      description={
                        contract.fileKey
                          ? "Baixar documento"
                          : "Erro ao localizar o documento"
                      }
                    >
                      <Button
                        variant="ghost"
                        type="button"
                        disabled={!contract.fileKey}
                        onClick={() => handleDownload(contract.id)}
                      >
                        {contract.fileKey ? (
                          <Eye className="w-4 y-4" />
                        ) : (
                          <EyeClosed className="w-4 y-4" />
                        )}
                      </Button>
                    </Tooltip>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-primary/20 flex-1">
              <CardHeader>
                <CardTitle className="text-base">Canal de Envio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="communicationChannel"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                        Selecione como o cliente será notificado
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col gap-3"
                        >
                          {communicationChannels.map((channel) => (
                            <FormItem
                              key={channel.id}
                              className="space-y-0" // Remove o espaçamento padrão entre rádio e mensagem
                            >
                              <FormControl>
                                {/* Ocultamos o rádio visualmente mas mantemos ele funcional */}
                                <RadioGroupItem
                                  value={channel.id}
                                  className="sr-only"
                                />
                              </FormControl>

                              <FormLabel
                                className={cn(
                                  "flex items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all",
                                  selectedChannel === channel.id &&
                                    "border-primary bg-primary/5 ring-1 ring-primary",
                                  selectedChannel !== channel.id &&
                                    "border-muted hover:border-muted-foreground/50"
                                )}
                              >
                                {/* Indicador visual personalizado (círculo) */}
                                <div
                                  className={cn(
                                    "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                                    selectedChannel === channel.id &&
                                      "border-primary",
                                    selectedChannel !== channel.id &&
                                      "border-muted-foreground/30"
                                  )}
                                >
                                  {selectedChannel === channel.id && (
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                  )}
                                </div>
                                <span className="font-medium text-sm">
                                  {channel.label}
                                </span>
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <Button
                  type="submit"
                  className="w-full h-12 gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    "Processando..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Contrato
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
