import { describe, expect, it } from "vitest";
import { ProposalStatus } from "../generated/prisma/enums";
import { checkIfProposalIsEditable } from "./checkIfProposalIsEditable";

describe("checkIfProposalIsEditable", () => {
  it("deve retornar todas as flags verdadeiras quando status for informado", () => {
    const result = checkIfProposalIsEditable(ProposalStatus.DRAFT);

    expect(result).toEqual({
      isProposalInactive: true,
      isProposalAccepted: true,
      isProposalEditable: true,
      canBeCancelled: true,
    });
  });

  it("deve avaliar REJECTED como inativo quando status for falsy", () => {
    const result = checkIfProposalIsEditable(
      null as unknown as ProposalStatus,
    );

    expect(result).toEqual({
      isProposalInactive: false,
      isProposalAccepted: false,
      isProposalEditable: false,
      canBeCancelled: false,
    });
  });

});
