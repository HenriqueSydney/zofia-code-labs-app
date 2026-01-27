"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Eye, Send, ThumbsUp, EyeClosed, Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { Tooltip } from "@/components/Tooltip";

// Actions e Utils
import { changeContractStatusAction } from "@/actions/contract/changeContractStatus";
import { getContractDownloadUrl } from "@/actions/contract/getContractDownloadUrl";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { date } from "@/lib/dayjs";
import { Link } from "@/i18n/navigation";

// Componentes Customizados
import { AttachmentIcon } from "@/components/AttachmentIcon";
import { FormRadioCards } from "@/components/form/FormRadioCards";

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
  const isTemplate = contract.sourceType === "SYSTEM_TEMPLATE";

  const form = useForm<FormValues>({
    resolver: zodResolver(toClientSchema),
    defaultValues: {
      communicationChannel: "email",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const result = await changeContractStatusAction(
        contract.id,
        "SENT",
        data.communicationChannel,
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        `Contrato enviado via ${data.communicationChannel} com sucesso!`,
      );
      onSuccess();
    } catch (error) {
      toast.error("Erro inesperado ao encaminhar o contrato.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: string) => {
    const result = await getContractDownloadUrl(id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    window.open(result.url, "_blank");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cabeçalho de Status */}
      <Alert className="bg-green-800/10 border-green-300/30">
        <ThumbsUp className="h-4 w-4" />
        <AlertTitle>Contrato Pronto para Envio</AlertTitle>
        <AlertDescription>
          O documento foi gerado. Selecione o canal abaixo para notificar o
          cliente.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Card do Documento */}
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

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border">
                <div className="flex items-center gap-3">
                  <AttachmentIcon extension="pdf" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium line-clamp-1">
                      Visualizar PDF
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {date(contract.createdAt).format("DD/MM/YYYY")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Botão de Visualizar (Link direto se existir, ou via action) */}
                  {contract.fileUrl && (
                    <Link href={contract.fileUrl} target="_blank">
                      <Tooltip description="Abrir em nova aba">
                        <Button variant="ghost" size="icon" type="button">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </Link>
                  )}

                  {/* Botão de Download (Força download via signed URL) */}
                  <Tooltip
                    description={
                      contract.fileKey ? "Baixar documento" : "Indisponível"
                    }
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      disabled={!contract.fileKey}
                      onClick={() => handleDownload(contract.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card do Canal de Envio */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Canal de Envio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Refatorado com FormRadioCards */}
              <FormRadioCards
                control={form.control}
                name="communicationChannel"
                label="Notificar via:"
                options={[
                  {
                    value: "email",
                    label: "E-mail",
                    description: "Envio formal com link seguro",
                  },
                  {
                    value: "whatsapp",
                    label: "WhatsApp",
                    description: "Notificação rápida",
                  },
                ]}
              />

              <Separator />

              <Button
                type="submit"
                className="w-full h-12 gap-2 shadow-sm"
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
        </form>
      </Form>
    </div>
  );
}
