import { ProjectStatus } from "@/generated/prisma/browser";
import { describe, expect, it, vi } from "vitest";

const ToTechAnalysis = vi.fn();
const ToProposal = vi.fn();
const ToProposalGenerated = vi.fn();
const ToWaitingSignature = vi.fn();
const DefaultTransitionForm = vi.fn();

vi.mock("./strategies/ToTechAnalysis", () => ({ ToTechAnalysis }));
vi.mock("./strategies/ToProposal", () => ({ ToProposal }));
vi.mock("./strategies/ToProposalGenerated", () => ({
  ToProposalGenerated,
}));
vi.mock("./strategies/ToWaitingSignature", () => ({
  ToWaitingSignature,
}));
vi.mock("./strategies/DefaultTransitionForm", () => ({
  DefaultTransitionForm,
}));

const { getTransitionStrategy, TRANSITION_STRATEGIES } = await import(
  "./transitionRegistry"
);

describe("getTransitionStrategy", () => {
  it("deve retornar ToTechAnalysis para TECH_ANALYSIS", () => {
    expect(getTransitionStrategy(ProjectStatus.TECH_ANALYSIS)).toBe(
      ToTechAnalysis,
    );
  });

  it("deve retornar ToProposal para PROPOSAL", () => {
    expect(getTransitionStrategy(ProjectStatus.PROPOSAL)).toBe(ToProposal);
  });

  it("deve retornar ToProposalGenerated para PROPOSAL_GENERATED", () => {
    expect(getTransitionStrategy(ProjectStatus.PROPOSAL_GENERATED)).toBe(
      ToProposalGenerated,
    );
  });

  it("deve retornar ToWaitingSignature para WAITING_SIGNATURE", () => {
    expect(getTransitionStrategy(ProjectStatus.WAITING_SIGNATURE)).toBe(
      ToWaitingSignature,
    );
  });

  it("deve retornar DefaultTransitionForm para status sem estratégia mapeada", () => {
    expect(getTransitionStrategy(ProjectStatus.DRAFT)).toBe(
      DefaultTransitionForm,
    );
    expect(getTransitionStrategy(ProjectStatus.IN_PROGRESS)).toBe(
      DefaultTransitionForm,
    );
    expect(getTransitionStrategy(ProjectStatus.COMPLETED)).toBe(
      DefaultTransitionForm,
    );
  });

  it("deve expor todas as estratégias mapeadas em TRANSITION_STRATEGIES", () => {
    expect(TRANSITION_STRATEGIES[ProjectStatus.TECH_ANALYSIS]).toBe(
      ToTechAnalysis,
    );
    expect(TRANSITION_STRATEGIES[ProjectStatus.PROPOSAL]).toBe(ToProposal);
    expect(TRANSITION_STRATEGIES[ProjectStatus.PROPOSAL_GENERATED]).toBe(
      ToProposalGenerated,
    );
    expect(TRANSITION_STRATEGIES[ProjectStatus.WAITING_SIGNATURE]).toBe(
      ToWaitingSignature,
    );
  });
});
