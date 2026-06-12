import { describe, expect, it, vi } from "vitest";
import {
  getContractNextStepLabel,
  getProposalNextStepLabel,
} from "./getNextStageLabel";

describe("getProposalNextStepLabel", () => {
  const t = vi.fn((key: string) => `t:${key}`);

  it("deve traduzir chave de rascunho quando proposta for nula", () => {
    const result = getProposalNextStepLabel(null, t);

    expect(result).toBe("t:generateProposalDraft");
    expect(t).toHaveBeenCalledWith("generateProposalDraft");
  });

  it("deve traduzir chave conforme status da proposta", () => {
    const result = getProposalNextStepLabel({ status: "SENT" } as never, t);

    expect(result).toBe("t:confirmAcceptance");
    expect(t).toHaveBeenCalledWith("confirmAcceptance");
  });
});

describe("getContractNextStepLabel", () => {
  const t = vi.fn((key: string) => `t:${key}`);

  it("deve traduzir chave de rascunho quando contrato for nulo", () => {
    const result = getContractNextStepLabel(null, t);

    expect(result).toBe("t:reviewContractDraft");
    expect(t).toHaveBeenCalledWith("reviewContractDraft");
  });

  it("deve traduzir chave conforme status do contrato", () => {
    const result = getContractNextStepLabel({ status: "SIGNED" } as never, t);

    expect(result).toBe("t:advanceToDevelopment");
    expect(t).toHaveBeenCalledWith("advanceToDevelopment");
  });
});
