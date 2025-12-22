import { ProposalStatus } from "@/generated/prisma/enums";

export function checkIfProposalIsEditable(proposalStatus: ProposalStatus) {
  if (proposalStatus) {
    return {
      isProposalInactive: true,
      isProposalAccepted: true,
      isProposalEditable: true,
      canBeCancelled: true,
    };
  }

  const inactiveProposals: ProposalStatus[] = ["REJECTED", "CANCELLED"];
  const acceptedProposals: ProposalStatus[] = ["ACCEPTED"];
  const editableProposals: ProposalStatus[] = ["DRAFT", "REVIEW"];
  const activeProposalThatCanBeCancelledStatus: ProposalStatus[] = [
    "ACCEPTED",
    "DRAFT",
    "REVIEW",
    "SENT",
  ];

  const isProposalInactive = inactiveProposals.includes(proposalStatus);
  const isProposalAccepted = acceptedProposals.includes(proposalStatus);
  const isProposalEditable = editableProposals.includes(proposalStatus);
  const canBeCancelled =
    activeProposalThatCanBeCancelledStatus.includes(proposalStatus);

  return {
    isProposalInactive,
    isProposalAccepted,
    isProposalEditable,
    canBeCancelled,
  };
}
