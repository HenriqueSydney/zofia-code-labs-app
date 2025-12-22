"use client";

import { getProposalStatusBadge } from "@/mappers/proposalStatusBadge";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { checkIfProposalIsEditable } from "@/utils/checkIfProposalIsEditable";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  CheckCircle,
  ChevronRight,
  Download,
  Eye,
  FileEdit,
  Send,
  User,
} from "lucide-react";
import { ProposalDetailsModal } from "./ProposalDetailsModal";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ProjectTransitionDialog } from "@/components/features/projects/transitions/TransitionDialog";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { Badge } from "@/components/ui/badge";
import { date } from "@/lib/dayjs";
import { useState } from "react";
import { getProposalNextStepLabel } from "@/utils/getNextStageLabel";
import { Tooltip } from "@/components/Tooltip";

interface IProposalHistoryList {
  proposal: ProposalWithDetails;
  project: ProjectWithDetails;
}

export function ProposalHistoryList({
  proposal,
  project,
}: IProposalHistoryList) {
  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false);
  const { isProposalEditable } = checkIfProposalIsEditable(proposal.status);
  const nextStageProposalLabel = getProposalNextStepLabel(project.proposal);

  return (
    <div key={proposal.id} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            {proposal.proposalTemplate?.template && (
              <h4 className="font-medium">
                {proposal.proposalTemplate?.template?.title}
              </h4>
            )}
            <Badge variant="outline">Versão: {proposal.version}</Badge>
          </div>
          <p className="text-lg font-semibold text-primary mt-1">
            {formatCurrency(Number(proposal.totalValue))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getProposalStatusBadge(proposal.status)}
          <ProposalDetailsModal proposal={proposal} />
          {isProposalEditable && proposal.isCurrent && (
            <Link href={proposal.id}>
              <Button variant="ghost" size="icon">
                <FileEdit className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {(proposal.fileUrl || proposal.fileKey) && (
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          )}
          {isProposalEditable && proposal.isCurrent && (
            <>
              <Tooltip description={nextStageProposalLabel}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-primary/20"
                  onClick={() => setShowAdvanceDialog(true)}
                  aria-label={nextStageProposalLabel}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Tooltip>
              <ProjectTransitionDialog
                currentStatusLabel={project.status}
                isOpen={showAdvanceDialog}
                onOpenChange={setShowAdvanceDialog}
                project={project}
                targetStatus="PROPOSAL_GENERATED"
                targetStatusLabel="Análise de Proposta"
                contextData={proposal}
              />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2 border-t">
        <div>
          <p className="text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" /> Criado por
          </p>
          {proposal.createdUser && (
            <p className="font-medium">{proposal.createdUser?.name}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {date(proposal.createdAt).format("DD/MM/YYYY HH:mm")}
          </p>
        </div>
        {proposal.reviewedBy && (
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" /> Revisado por
            </p>
            <p className="font-medium">{proposal.reviewedBy}</p>
            <p className="text-xs text-muted-foreground">
              {date(proposal.reviewedAt!).format("DD/MM/YYYY HH:mm")}
            </p>
          </div>
        )}
        {proposal.approvedBy && (
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Aprovado por
            </p>
            <p className="font-medium">{proposal.approvedBy}</p>
            <p className="text-xs text-muted-foreground">
              {date(proposal.approvedAt!).format("DD/MM/YYYY HH:mm")}
            </p>
          </div>
        )}
        {proposal.status === "SENT" && (
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Send className="h-3 w-3" /> Proposta enviada para o cliente
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
