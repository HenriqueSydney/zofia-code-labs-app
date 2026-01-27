"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { FileText, Eye, Send, ThumbsUp, EyeClosed } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { Tooltip } from "@/components/Tooltip";

import { ProposalDetails } from "@/components/ProposalDetail";
import { AttachmentIcon } from "@/components/AttachmentIcon";

import { changeProposalStatusAction } from "@/actions/proposal/changeProposalStatus";
import { getProposalDownloadUrl } from "@/actions/proposal/getProposalDownloadUrl";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { date } from "@/lib/dayjs";
import { Link } from "@/i18n/navigation";
import { FormRadioCards } from "@/components/form/FormRadioCards";

// Schema
const toClientSchema = z.object({
  communicationChannel: z.enum(["email", "whatsapp"], {
    error: "Selecione um canal de comunicação",
  }),
});

type FormValues = z.infer<typeof toClientSchema>;

interface ProposalSendToClientProps {
  proposal: ProposalWithDetails;
  onSuccess: () => void;
}

export function ProposalSendToClient({
  proposal,
  onSuccess,
}: ProposalSendToClientProps) {
  const [loading, setLoading] = useState(false);
  const isTemplate = proposal.sourceType === "SYSTEM_TEMPLATE";

  const form = useForm<FormValues>({
    resolver: zodResolver(toClientSchema),
    defaultValues: {
      communicationChannel: "email",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const result = await changeProposalStatusAction(
        proposal.id,
        "SENT",
        data.communicationChannel,
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        `Proposta enviada via ${data.communicationChannel} com sucesso!`,
      );
      onSuccess();
    } catch (error) {
      toast.error("Erro inesperado ao encaminhar a proposta.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: string) => {
    const result = await getProposalDownloadUrl(id);
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
        <AlertTitle>Proposta Pronta para Envio</AlertTitle>
        <AlertDescription>
          Esta proposta foi aprovada internamente em{" "}
          <strong>
            {date(proposal.approvedAt).format("DD/MM/YYYY HH:mm")}
          </strong>
          . Selecione o canal abaixo para notificar o cliente.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Coluna Principal - Detalhes */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Conteúdo da Proposta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProposalDetails proposal={proposal} />
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Configuração de Envio */}
          <div className="flex flex-col space-y-4">
            {/* Card do Documento (PDF) */}
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

                {/* Preview do Arquivo */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <AttachmentIcon extension="pdf" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium line-clamp-1">
                        Visualizar PDF
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {date(proposal.createdAt).format("DD/MM/YYYY")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Se tiver URL pública, permite link direto, senão usa ação de download */}
                    {proposal.fileUrl && (
                      <Link href={proposal.fileUrl} target="_blank">
                        <Button variant="ghost" size="icon" type="button">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}

                    <Tooltip
                      description={
                        proposal.fileKey ? "Baixar documento" : "Indisponível"
                      }
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        disabled={!proposal.fileKey}
                        onClick={() => handleDownload(proposal.id)}
                      >
                        {proposal.fileKey ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeClosed className="w-4 h-4" />
                        )}
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card do Canal de Envio */}
            <Card className="border-primary/20 flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">Canal de Envio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 flex-1 flex flex-col">
                {/* Substituímos todo o RadioGroup manual por isso: */}
                <FormRadioCards
                  control={form.control}
                  name="communicationChannel"
                  label="Notificar via:"
                  options={[
                    {
                      value: "email",
                      label: "E-mail",
                      description: "Envio formal via sistema",
                    },
                    {
                      value: "whatsapp",
                      label: "WhatsApp",
                      description: "Notificação rápida",
                    },
                  ]}
                />
                <div className="flex-1" /> {/* Spacer */}
                <Separator />
                <Button
                  type="submit"
                  className="w-full h-12 gap-2 shadow-md"
                  disabled={loading}
                >
                  {loading ? (
                    "Processando..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Proposta
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
