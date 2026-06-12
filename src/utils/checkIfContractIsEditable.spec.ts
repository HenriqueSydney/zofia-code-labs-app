import { describe, expect, it } from "vitest";
import { ContractStatus } from "../generated/prisma/enums";
import type { ContractWithDetails } from "../repositories/IContractRepository";
import { checkIfContractIsEditable } from "./checkIfContractIsEditable";

function contractWithStatus(status: ContractStatus): ContractWithDetails {
  return { status } as ContractWithDetails;
}

describe("checkIfContractIsEditable", () => {
  it("deve permitir edição quando contrato for nulo", () => {
    const result = checkIfContractIsEditable(null as unknown as ContractWithDetails);

    expect(result).toEqual({
      isContractInactive: true,
      isContractEditable: true,
      canBeCancelled: true,
    });
  });

  it("deve marcar DRAFT como editável e cancelável", () => {
    const result = checkIfContractIsEditable(contractWithStatus(ContractStatus.DRAFT));

    expect(result).toEqual({
      isContractInactive: false,
      isContractEditable: true,
      canBeCancelled: true,
    });
  });

  it("deve marcar CANCELLED como inativo e não editável", () => {
    const result = checkIfContractIsEditable(
      contractWithStatus(ContractStatus.CANCELLED),
    );

    expect(result).toEqual({
      isContractInactive: true,
      isContractEditable: false,
      canBeCancelled: false,
    });
  });

  it("deve marcar SIGNED como não editável mas não inativo", () => {
    const result = checkIfContractIsEditable(
      contractWithStatus(ContractStatus.SIGNED),
    );

    expect(result).toEqual({
      isContractInactive: false,
      isContractEditable: false,
      canBeCancelled: false,
    });
  });
});
