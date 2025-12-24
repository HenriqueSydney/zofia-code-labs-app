
import { ContractStatus } from "@/generated/prisma/enums";
import { ContractWithDetails } from "@/repositories/IContractRepository";

export function checkIfContractIsEditable(contract: ContractWithDetails) {
  if (!contract) {
    return {
      isContractInactive: true,
      isContractEditable: true,
      canBeCancelled: true,
    };
  }

  const contractStatus = contract.status

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
