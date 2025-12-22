import { ProjectWithDetails } from "@/repositories/IProjectsRepository";

export const getProposalNextStepLabel = (
  proposal: ProjectWithDetails["proposal"] | null
) => {
  const proposalStatusLabel: Record<
    ProjectWithDetails["proposal"]["status"],
    string
  > = {
    DRAFT: "Revisar minuta de proposta",
    REVIEW: "Aprovar proposta comercial",
    APPROVED: "Encaminhar proposta ao cliente",
    SENT: "Confirmar aceite",
    ACCEPTED: "Avançar para Etapa de Contrato",
    REJECTED: "Gerar nova proposta",
  };

  return !proposal
    ? "Gerar minuta de proposta"
    : proposalStatusLabel[proposal.status];
};

export const getContractNextStepLabel = (
  contract: ProjectWithDetails["contract"] | null
) => {
  const contractStatusLabel: Record<
    ProjectWithDetails["contract"]["status"],
    string
  > = {
    DRAFT: "Revisar minuta do contrato",
    REVIEW: "Aprovar contrato e encaminhar para o cliente",
    SENT: "Confirmar assinatura",
    SIGNED: "Avançar para etapa de desenvolvimento",
    CANCELLED: "Proposta cancelada",
  };

  return !contract
    ? "Gerar minuta de contrato"
    : contractStatusLabel[contract.status];
};
