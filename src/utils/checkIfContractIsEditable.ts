import { ContractStatus } from "@/generated/prisma/enums";

export function checkIfContractIsEditable(contractStatus: ContractStatus) {
  if (contractStatus) {
    return {
      isContractInactive: true,
      isContractEditable: true,
      canBeCancelled: true,
    };
  }

  const inactiveContracts: ContractStatus[] = ["CANCELLED"];
  const editableContracts: ContractStatus[] = ["DRAFT", "REVIEW"];
  const activeContractThatCanBeCancelledStatus: ContractStatus[] = [
    "DRAFT",
    "REVIEW",
    "SENT",
  ];

  const isContractInactive = inactiveContracts.includes(contractStatus);
  const isContractEditable = editableContracts.includes(contractStatus);
  const canBeCancelled =
    activeContractThatCanBeCancelledStatus.includes(contractStatus);

  return {
    isContractInactive,
    isContractEditable,
    canBeCancelled,
  };
}
