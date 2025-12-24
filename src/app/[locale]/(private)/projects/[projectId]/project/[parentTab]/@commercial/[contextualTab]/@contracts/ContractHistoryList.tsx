"use client";

import { getProposalStatusBadge } from "@/mappers/proposalStatusBadge";
import {
  CheckCircle,
  ChevronRight,
  Download,
  Eye,
  FileEdit,
  Send,
  Signature,
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
import { getContractDownloadUrl } from "@/actions/contract/getContractDownloadUrl";
import { toast } from "sonner";

interface IContractHistoryList {
  contract: ContractWithDetails;
  project: ProjectWithDetails;
}

export function ContractHistoryList({
  contract,
  project,
}: IContractHistoryList) {
  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false);
  const { isContractEditable } = checkIfContractIsEditable(contract);
  const nextStageContractLabel = getContractNextStepLabel(project.contract);

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

          {contract.externalSignId && (
            <Tooltip description="Visualizar assinaturas">
              <Link href={`signature/${contract.id}`}>
                <Button variant="ghost" size="icon">
                  <Signature className="h-4 w-4" />
                </Button>
              </Link>
            </Tooltip>
          )}
          {(contract.fileUrl || contract.fileKey) && (
            <Tooltip
              description={
                contract.fileKey
                  ? "Baixar documento"
                  : "Erro ao localizar o documento"
              }
            >
              <Button
                variant="ghost"
                disabled={!contract.fileKey}
                onClick={() => handleDownload(contract.id)}
              >
                <Download className="w-4 y-4" />
              </Button>
            </Tooltip>
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
