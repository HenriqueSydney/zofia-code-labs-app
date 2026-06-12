"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Eye,
  Send,
  ThumbsUp,
  EyeClosed,
  Download,
  AlertCircle,
} from "lucide-react";
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
import { clientHasResponsible } from "@/lib/clients/assertClientHasResponsible";

// Componentes Customizados
import { AttachmentIcon } from "@/components/AttachmentIcon";
import { FormRadioCards } from "@/components/form/FormRadioCards";
import { useTranslations } from "next-intl";

const createToClientSchema = (channelError: string) =>
  z.object({
    communicationChannel: z.enum(["email", "none", "whatsapp"], {
      error: channelError,
    }),
  });

type FormValues = z.infer<ReturnType<typeof createToClientSchema>>;

interface ContractSendToClientProps {
  contract: ContractWithDetails;
  onSuccess: () => void;
  onBack?: () => void;
}

export function ContractSendToClient({
  contract,
  onSuccess,
}: ContractSendToClientProps) {
  const t = useTranslations("projects.transitions.send");
  const tContract = useTranslations("projects.transitions.contractSend");
  const tProposalSend = useTranslations("projects.transitions.proposalSend");
  const tCommon = useTranslations("projects.transitions.common");
  const [loading, setLoading] = useState(false);
  const client = contract.project.client;
  const missingResponsible = !clientHasResponsible(client);

  const toClientSchema = createToClientSchema(t("selectChannel"));

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
        tContract("toast.success", {
          channel: data.communicationChannel,
        }),
      );
      onSuccess();
    } catch (error) {
      toast.error(tContract("toast.unexpectedError"));
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
        <AlertTitle>{tContract("alert.title")}</AlertTitle>
        <AlertDescription>{tContract("alert.description")}</AlertDescription>
      </Alert>

      {missingResponsible && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{tContract("missingResponsible.title")}</AlertTitle>
          <AlertDescription>
            {tContract("missingResponsible.description")}{" "}
            <Link
              href={`/clients/${client.slug}`}
              className="underline font-medium"
            >
              {tContract("missingResponsible.editClient")}
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Card do Documento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {tProposalSend("document.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 text-sm text-muted-foreground">
                <strong>{tContract("originLabel")}</strong>
                <span>
                  {tProposalSend("document.originUpload")}
                </span>
              </div>
              <Separator />

              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border">
                <div className="flex items-center gap-3">
                  <AttachmentIcon extension="pdf" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium line-clamp-1">
                      {tProposalSend("document.viewPdf")}
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
                      <Tooltip description={tContract("openInNewTab")}>
                        <Button variant="ghost" size="icon" type="button">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </Link>
                  )}

                  {/* Botão de Download (Força download via signed URL) */}
                  <Tooltip
                    description={
                      contract.fileKey ? t("download") : t("unavailable")
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
              <CardTitle className="text-base">
                {tProposalSend("channel.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormRadioCards
                control={form.control}
                name="communicationChannel"
                label={tContract("notifyVia")}
                options={[
                  {
                    value: "email",
                    label: tProposalSend("channel.email.label"),
                    description: tContract("emailDescription"),
                  },
                  {
                    value: "none",
                    label: tProposalSend("channel.none.label"),
                    description: tProposalSend("channel.none.description"),
                  },
                  // {
                  //   value: "whatsapp",
                  //   label: tProposalSend("channel.whatsapp.label"),
                  //   description: t("quickNotification"),
                  // },
                ]}
              />

              <Separator />

              <Button
                type="submit"
                className="w-full h-12 gap-2 shadow-sm"
                disabled={loading || missingResponsible}
              >
                {loading ? (
                  tCommon("processing")
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {tContract("submit")}
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
