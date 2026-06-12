"use client";

import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeClosed,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ProposalDetails } from "@/components/ProposalDetail";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { date } from "@/lib/dayjs";
import { AttachmentIcon } from "@/components/AttachmentIcon";
import { changeProposalStatusAction } from "@/actions/proposal/changeProposalStatus";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatCurrency";
import { getProposalDownloadUrl } from "@/actions/proposal/getProposalDownloadUrl";
import { Tooltip } from "@/components/Tooltip";

interface ProposalReviewProps {
  proposal: any;
  onSuccess: () => void;
  onBack?: () => void;
}

export function ProposalReview({
  proposal,
  onSuccess,
  onBack,
}: ProposalReviewProps) {
  const t = useTranslations("projects.transitions.proposalReview");
  const tCommon = useTranslations("common");
  const tProposals = useTranslations("proposals.history");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const result = await changeProposalStatusAction(proposal.id, "APPROVED");

      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(t("toast.approved"));
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

    const { url } = result;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Alert className="bg-accent/10 border-accent/30">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("alert.title")}</AlertTitle>
        <AlertDescription>{t("alert.description")}</AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                {t("contentTitle")}
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
              <CardTitle className="text-base">{t("generatedTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <strong>{tCommon("origin")}</strong>
                  <span>{t("originUpload")}</span>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <AttachmentIcon extension="pdf" />
                      <div>
                        <p className="text-sm font-medium line-clamp-1">
                          {t("generatedDocument")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {date(proposal.createdAt).format("DD/MM/YYYY HH:mm")}
                        </p>
                      </div>
                    </div>
                    <Tooltip
                      description={
                        proposal.fileKey
                          ? tProposals("downloadDocument")
                          : tProposals("documentNotFound")
                      }
                    >
                      <Button
                        variant="ghost"
                        type="button"
                        disabled={!proposal.fileKey}
                        onClick={() => handleDownload(proposal.id)}
                      >
                        {proposal.fileKey ? (
                          <Eye className="w-4 y-4" />
                        ) : (
                          <EyeClosed className="w-4 y-4" />
                        )}
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col flex-1">
            <CardHeader>
              <CardTitle className="text-base">{tCommon("summary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("createdAt")}</span>
                <span>
                  {date(proposal.createdAt).format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("originLabel")}</span>
                <Badge variant="outline">
                  {t("originPdfFile")}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("totalValue")}</span>
                <strong className="truncate max-w-[150px] text-right ">
                  {formatCurrency(Number(proposal.totalValue))}
                </strong>
              </div>

              <Separator />

              <div className="pt-2 h-full flex flex-col justify-between items-center">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  {loading ? (
                    tCommon("processing")
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      {t("approveButton")}
                    </>
                  )}
                </Button>

                {onBack && (
                  <Button
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={onBack}
                    disabled={loading}
                  >
                    {t("backAndEdit")}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
