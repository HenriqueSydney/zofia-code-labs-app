import { ProjectWithDetails } from "@/repositories/IProjectsRepository";

type NextStepTranslator = (key: string) => string;

const proposalNextStepKeys: Record<
  ProjectWithDetails["proposal"]["status"],
  string
> = {
  DRAFT: "reviewDraft",
  REVIEW: "approveCommercial",
  APPROVED: "sendToClient",
  SENT: "confirmAcceptance",
  ACCEPTED: "advanceToContract",
  REJECTED: "generateNewProposal",
  CANCELLED: "generateNewProposal",
};

const contractNextStepKeys: Record<
  ProjectWithDetails["contract"]["status"],
  string
> = {
  DRAFT: "reviewContractDraft",
  REVIEW: "approveAndSendToClient",
  SENT: "confirmSignature",
  SIGNED: "advanceToDevelopment",
  CANCELLED: "proposalCancelled",
  REJECTED: "contractRejected",
};

export const getProposalNextStepLabel = (
  proposal: ProjectWithDetails["proposal"] | null,
  t: NextStepTranslator,
) => {
  if (!proposal) {
    return t("generateProposalDraft");
  }

  return t(proposalNextStepKeys[proposal.status]);
};

export const getContractNextStepLabel = (
  contract: ProjectWithDetails["contract"] | null,
  t: NextStepTranslator,
) => {
  if (!contract) {
    return t(contractNextStepKeys.DRAFT);
  }

  return t(contractNextStepKeys[contract.status]);
};
