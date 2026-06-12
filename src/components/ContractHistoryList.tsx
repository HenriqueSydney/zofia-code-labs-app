"use client";

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
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ProjectTransitionDialog } from "@/app/[locale]/(private)/clients/[client]/projects/[slug]/[parentTab]/@overview/transitions/TransitionDialog";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { date } from "@/lib/dayjs";
import { useState } from "react";
import { getContractNextStepLabel } from "@/utils/getNextStageLabel";
import { Tooltip } from "@/components/Tooltip";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { checkIfContractIsEditable } from "@/utils/checkIfContractIsEditable";
import { getContractDownloadUrl } from "@/actions/contract/getContractDownloadUrl";
import { toast } from "sonner";
import { contractStatusBadge } from "@/mappers/contractStatusBadge";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { hasPermission } from "@/utils/hasPermission";
import { PERMISSIONS } from "@/constants/permissions";

interface IContractHistoryList {
  contract: ContractWithDetails;
  project?: ProjectWithDetails;
}

export function ContractHistoryList({
  contract,
  project,
}: IContractHistoryList) {
  const tContracts = useTranslations("contracts");
  const tHistory = useTranslations("contracts.history");
  const tCommon = useTranslations("common");
  const tNextSteps = useTranslations("projects.transitions.nextSteps");
  const translateNextStep = (key: string) =>
    tNextSteps(key as Parameters<typeof tNextSteps>[0]);
  const { data: session } = useSession();
  const [showAdvanceDialog, setShowAdvanceDialog] = useState(false);
  const { isContractEditable } = checkIfContractIsEditable(contract);
  const nextStageContractLabel = project
    ? getContractNextStepLabel(project.contract, translateNextStep)
    : "";

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

  const privateLink = `/clients/${contract.project.client.slug}/projects/${contract.project.slug}/commercial/contracts/signature/${contract.id}`;
  const clientLink = `/clients/${contract.project.client.slug}/contracts/signature/${contract.id}`;
  const finalLink = session?.user.role !== "OWNER" ? privateLink : clientLink;

  const canManageContrat = hasPermission(
    session?.user,
    PERMISSIONS.CONTRACT.CREATE,
  );

  return (
    <div key={contract.id} className="border rounded-lg p-4 space-y-3">
      <div className="flex flex-col">
        {!project && <strong>{contract.project.name}</strong>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pb-2 border-b">
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" /> {tHistory("createdBy")}
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
                <Eye className="h-3 w-3" /> {tHistory("reviewedBy")}
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
                <CheckCircle className="h-3 w-3" /> {tHistory("approvedBy")}
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
                <Send className="h-3 w-3" /> {tHistory("sentToClient")}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-start justify-end">
        <div className="flex items-center gap-2">
          {contractStatusBadge(contract.status, (key) =>
            tContracts(
              key as
                | "status.draft"
                | "status.review"
                | "status.sent"
                | "status.signed"
                | "status.rejected"
                | "status.cancelled",
            ),
          )}
          {/* <ProposalDetailsModal proposal={project.proposal} /> */}
          {isContractEditable && contract.isCurrent && (
            <Link href={contract.id}>
              <Button variant="ghost" size="icon">
                <FileEdit className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {contract.externalSignId && (
            <Tooltip description={tCommon("viewSignatures")}>
              <Link href={finalLink}>
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
                  ? tCommon("downloadDocument")
                  : tCommon("documentNotFound")
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
          {project &&
            isContractEditable &&
            contract.isCurrent &&
            canManageContrat && (
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
                  targetStatusLabel={tHistory("contractAnalysis")}
                  contextData={contract}
                />
              </>
            )}
        </div>
      </div>
    </div>
  );
}
