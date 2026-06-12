"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ThumbsUp, ThumbsDown, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";

import { ProposalDetails } from "@/components/ProposalDetail";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { changeProposalStatusAction } from "@/actions/proposal/changeProposalStatus";
import { date } from "@/lib/dayjs";
import { FormSelect } from "@/components/form/FormSelect";
import { FormTextarea } from "@/components/form/FormTextarea";

const REJECTION_REASON_VALUES = {
  PRICE: "PRICE",
  DEADLINE: "DEADLINE",
  COMPETITION: "COMPETITION",
  SCOPE: "SCOPE",
  OTHER: "OTHER",
} as const;

const createRejectionSchema = (
  reasonRequired: string,
  reasonMin: string,
) =>
  z.object({
    reason: z.string({ error: reasonRequired }).min(1, reasonMin),
    notes: z.string().optional(),
  });

type RejectionSchemaType = z.infer<ReturnType<typeof createRejectionSchema>>;

interface IProposalConfirmation {
  proposal: ProposalWithDetails;
  onSuccess: () => void;
}

export function ProposalConfirmation({
  proposal,
  onSuccess,
}: IProposalConfirmation) {
  const t = useTranslations("projects.transitions.proposalConfirmation");
  const tCommon = useTranslations("projects.transitions.common");
  const [isPending, startTransition] = useTransition();
  const [isRejectFormOpen, setIsRejectFormOpen] = useState(false);

  const rejectionSchema = createRejectionSchema(
    t("validation.reasonRequired"),
    t("validation.reasonMin"),
  );

  const rejectionReasons = [
    {
      value: REJECTION_REASON_VALUES.PRICE,
      label: t("rejectionReasons.PRICE.label"),
    },
    {
      value: REJECTION_REASON_VALUES.DEADLINE,
      label: t("rejectionReasons.DEADLINE.label"),
    },
    {
      value: REJECTION_REASON_VALUES.COMPETITION,
      label: t("rejectionReasons.COMPETITION.label"),
    },
    {
      value: REJECTION_REASON_VALUES.SCOPE,
      label: t("rejectionReasons.SCOPE.label"),
    },
    {
      value: REJECTION_REASON_VALUES.OTHER,
      label: t("rejectionReasons.OTHER.label"),
    },
  ];

  const form = useForm<RejectionSchemaType>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: {
      reason: "",
      notes: "",
    },
  });

  async function executeAction(
    action: "REJECTED" | "ACCEPTED",
    details?: { reason: string; notes?: string },
  ) {
    if (!proposal) return;

    startTransition(async () => {
      try {
        const result = await changeProposalStatusAction(
          proposal.id,
          action,
          undefined,
          details,
        );

        if (result?.error) {
          toast.error(result.error);
          return;
        }

        toast.success(
          action === "ACCEPTED" ? t("toast.accepted") : t("toast.rejected"),
        );

        onSuccess();
      } catch (error: any) {
        if (error.message === "NEXT_REDIRECT") return;
        toast.error(t("toast.error"));
      }
    });
  }

  const handleAccept = () => {
    executeAction("ACCEPTED");
  };

  const onSubmitRejection = (data: RejectionSchemaType) => {
    executeAction("REJECTED", {
      reason: data.reason,
      notes: data.notes,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <Alert className="bg-green-800/10 border-green-300/30 col-span-2">
          <ThumbsUp className="h-4 w-4" />
          <AlertTitle className="font-semibold">{t("alert.title")}</AlertTitle>
          <AlertDescription className="opacity-90">
            {proposal?.approvedAt ? (
              <span>
                {t("alert.generatedAt")}{" "}
                {date(proposal.approvedAt).format("DD/MM/YYYY HH:mm")}
              </span>
            ) : (
              <span>{t("alert.awaitingClient")}</span>
            )}
            <br />
            {t("alert.instructions")}
          </AlertDescription>
        </Alert>

        {!isRejectFormOpen && (
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            <Button
              variant="outline"
              className="hover:!bg-destructive/10 hover:text-destructive w-full sm:w-auto"
              onClick={() => setIsRejectFormOpen(true)}
              disabled={isPending}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              {t("actions.reportRejection")}
            </Button>

            <Button onClick={handleAccept} disabled={isPending}>
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="w-4 h-4 mr-2" />
              )}
              {t("actions.confirmAcceptance")}
            </Button>
          </div>
        )}

        {isRejectFormOpen && (
          <Card className="border-destructive/30 bg-destructive/5 animate-in fade-in slide-in-from-top-2">
            <CardHeader className="w-full flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ThumbsDown className="w-4 h-4" />
                {t("rejectionForm.title")}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsRejectFormOpen(false);
                  form.reset();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitRejection)}
                  className="grid gap-4"
                >
                  <FormSelect
                    control={form.control}
                    name="reason"
                    label={t("rejectionForm.reason.label")}
                    placeholder={t("rejectionForm.reason.placeholder")}
                    options={rejectionReasons}
                    disabled={isPending}
                  />

                  <FormTextarea
                    control={form.control}
                    name="notes"
                    label={t("rejectionForm.notes.label")}
                    placeholder={t("rejectionForm.notes.placeholder")}
                    rows={3}
                    disabled={isPending}
                  />

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsRejectFormOpen(false)}
                      disabled={isPending}
                    >
                      {tCommon("cancel")}
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={isPending}
                    >
                      {isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {t("rejectionForm.submit")}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="bg-white/5" />

      <div className="opacity-90">
        {proposal && <ProposalDetails proposal={proposal} />}
      </div>
    </div>
  );
}
