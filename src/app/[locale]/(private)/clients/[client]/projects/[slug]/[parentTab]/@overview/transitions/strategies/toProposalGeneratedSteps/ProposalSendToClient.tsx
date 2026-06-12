"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { FileText, Eye, Send, ThumbsUp, EyeClosed } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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

const createToClientSchema = (channelError: string) =>
  z.object({
    communicationChannel: z.enum(["email", "none", "whatsapp"], {
      error: channelError,
    }),
  });

type FormValues = z.infer<ReturnType<typeof createToClientSchema>>;

interface ProposalSendToClientProps {
  proposal: ProposalWithDetails;
  onSuccess: () => void;
}

export function ProposalSendToClient({
  proposal,
  onSuccess,
}: ProposalSendToClientProps) {
  const t = useTranslations("projects.transitions.proposalSend");
  const tSend = useTranslations("projects.transitions.send");
  const tCommon = useTranslations("projects.transitions.common");
  const [loading, setLoading] = useState(false);
  const toClientSchema = createToClientSchema(tSend("selectChannel"));

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
        t("toast.success", { channel: data.communicationChannel }),
      );
      onSuccess();
    } catch (error) {
      toast.error(t("toast.unexpectedError"));
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

  const isNoSendChannel = form.watch("communicationChannel") === "none";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Alert className="bg-green-800/10 border-green-300/30">
        <ThumbsUp className="h-4 w-4" />
        <AlertTitle>{t("alert.title")}</AlertTitle>
        <AlertDescription>
          {t("alert.approvedAtPrefix")}{" "}
          <strong>
            {date(proposal.approvedAt).format("DD/MM/YYYY HH:mm")}
          </strong>
          {t("alert.selectChannelSuffix")}
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  {t("content.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProposalDetails proposal={proposal} />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("document.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <strong>{t("document.originLabel")}</strong>
                  <span>
                    {t("document.originUpload")}
                  </span>
                </div>
                <Separator />

                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-3">
                    <AttachmentIcon extension="pdf" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium line-clamp-1">
                        {t("document.viewPdf")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {date(proposal.createdAt).format("DD/MM/YYYY")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {proposal.fileUrl && (
                      <Link href={proposal.fileUrl} target="_blank">
                        <Button variant="ghost" size="icon" type="button">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}

                    <Tooltip
                      description={
                        proposal.fileKey
                          ? tSend("download")
                          : tSend("unavailable")
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

            <Card className="border-primary/20 flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">
                  {t("channel.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 flex-1 flex flex-col">
                <FormRadioCards
                  control={form.control}
                  name="communicationChannel"
                  label={t("channel.notifyVia")}
                  options={[
                    {
                      value: "email",
                      label: t("channel.email.label"),
                      description: t("channel.email.description"),
                    },
                    {
                      value: "none",
                      label: t("channel.none.label"),
                      description: t("channel.none.description"),
                    },
                    // {
                    //   value: "whatsapp",
                    //   label: t("channel.whatsapp.label"),
                    //   description: tSend("quickNotification"),
                    // },
                  ]}
                />
                <div className="flex-1" />
                <Separator />
                {isNoSendChannel && <Button
                  type="submit"
                  className="w-full h-12 gap-2 shadow-md"
                  disabled={loading}
                >
                  {loading ? (
                    tCommon("processing")
                  ) : (
                    <>
                      {t("submitNoSend")}
                    </>
                  )}
                </Button>}
               {!isNoSendChannel && <Button
                  type="submit"
                  className="w-full h-12 gap-2 shadow-md"
                  disabled={loading}
                >
                  {loading ? (
                    tCommon("processing")
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {t("submit")}
                    </>
                  )}
                </Button>}
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
