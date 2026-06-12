"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { useState } from "react";
import { getProposalStatusBadge } from "@/mappers/proposalStatusBadge";
import { ProposalDetails } from "@/components/ProposalDetail";
import { Tooltip } from "@/components/Tooltip";
import { useTranslations } from "next-intl";

interface IProposalDetailsModal {
  proposal: ProposalWithDetails;
}

export function ProposalDetailsModal({ proposal }: IProposalDetailsModal) {
  const tProposals = useTranslations("proposals");
  const tModal = useTranslations("proposals.modal");
  const [isOpen, setIsOpen] = useState(false);
  if (!proposal) return null;

  return (
    <>
      <Tooltip description={tModal("viewTooltip")}>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <Eye className="h-4 w-4" />
        </Button>
      </Tooltip>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                {tModal("defaultTitle")} v
                {proposal.version}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {tModal("projectLabel", {
                  name: proposal.project?.client?.tradeName ?? "",
                })}
              </p>
            </div>

            {getProposalStatusBadge(proposal.status, (key) =>
              tProposals(
                key as
                  | "status.draft"
                  | "status.review"
                  | "status.approved"
                  | "status.sent"
                  | "status.accepted"
                  | "status.rejected"
                  | "status.cancelled",
              ),
            )}
          </DialogHeader>
          <ProposalDetails proposal={proposal} />
        </DialogContent>
      </Dialog>
    </>
  );
}
