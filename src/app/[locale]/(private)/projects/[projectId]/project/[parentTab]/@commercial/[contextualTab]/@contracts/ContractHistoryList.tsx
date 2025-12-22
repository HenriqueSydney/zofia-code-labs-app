"use client";

import { getProposalStatusBadge } from "@/mappers/proposalStatusBadge";
import {
  CheckCircle,
  ChevronRight,
  Download,
  Eye,
  FileEdit,
  Send,
  User,
} from "lucide-react";
import { ProposalDetailsModal } from "../@proposals/ProposalDetailsModal";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ProjectTransitionDialog } from "@/components/features/projects/transitions/TransitionDialog";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { Badge } from "@/components/ui/badge";
import { date } from "@/lib/dayjs";
import { useState } from "react";
import { getContractNextStepLabel } from "@/utils/getNextStageLabel";
import { Tooltip } from "@/components/Tooltip";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { checkIfContractIsEditable } from "@/utils/checkIfContractIsEditable";

interface IContractHistoryList {
  contract: ContractWithDetails;
  project: ProjectWithDetails;
}

export function ContractHistoryList({
  contract,
  project,
}: IContractHistoryList) {
  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false);
  const { isContractEditable } = checkIfContractIsEditable(contract.status);
  const nextStageContractLabel = getContractNextStepLabel(project.contract);

  return (
    <div key={contract.id} className="border rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pb-2 border-b">
        <div>
          <p className="text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" /> Criado por
          </p>
          {contract.createdUser && (
            <p className="font-medium">{contract.createdUser?.name}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {date(contract.createdAt).format("DD/MM/YYYY HH:mm")}
          </p>
        </div>
        {contract.reviewedBy && (
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" /> Revisado por
            </p>
            <p className="font-medium">{contract.reviewedBy}</p>
            <p className="text-xs text-muted-foreground">
              {date(contract.reviewedAt!).format("DD/MM/YYYY HH:mm")}
            </p>
          </div>
        )}
        {contract.approvedBy && (
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Aprovado por
            </p>
            <p className="font-medium">{contract.approvedBy}</p>
            <p className="text-xs text-muted-foreground">
              {date(contract.approvedAt!).format("DD/MM/YYYY HH:mm")}
            </p>
          </div>
        )}
        {contract.status === "SENT" && (
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Send className="h-3 w-3" /> Contrato enviado para o cliente
            </p>
          </div>
        )}
      </div>
       <div className="flex items-start justify-end">
        <div className="flex items-center gap-2">
          {getProposalStatusBadge(project.proposal.status)}
          {/* <ProposalDetailsModal proposal={project.proposal} /> */}
          {isContractEditable && contract.isCurrent && (
            <Link href={contract.id}>
              <Button variant="ghost" size="icon">
                <FileEdit className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {(contract.fileUrl || contract.fileKey) && (
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          )}
          {isContractEditable && contract.isCurrent && (
            <>
              <Tooltip description={nextStageContractLabel}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-primary/20"
                  onClick={() => setShowAdvanceDialog(true)}
                  aria-label={nextStageContractLabel}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Tooltip>
              <ProjectTransitionDialog
                currentStatusLabel={project.status}
                isOpen={showAdvanceDialog}
                onOpenChange={setShowAdvanceDialog}
                project={project}
                targetStatus="WAITING_SIGNATURE"
                targetStatusLabel="Análise de Contrato"
                contextData={contract}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
