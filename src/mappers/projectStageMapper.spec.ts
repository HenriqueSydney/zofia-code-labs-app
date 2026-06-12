import { describe, expect, it } from "vitest";
import {
  allStages,
  cancelledStage,
  commercialStages,
  findTranslatedStage,
  onHoldStage,
  operationalStages,
  PIPELINE_CATEGORY_BY_STATUS,
  postProjectStage,
  translateStageConfig,
  translateStageConfigs,
} from "./projectStageMapper";

describe("projectStageMapper", () => {
  const t = (key: string) => `label:${key}`;

  it("deve conter todos os status do pipeline comercial e operacional", () => {
    const keys = allStages.map((s) => s.key);

    expect(keys).toContain("DRAFT");
    expect(keys).toContain("IN_PROGRESS");
    expect(keys).toContain("COMPLETED");
    expect(keys).toContain("CANCELLED");
    expect(keys).toContain("MAINTENANCE");
  });

  it("deve traduzir configuração de estágio com nextAction quando aplicável", () => {
    const stage = commercialStages[0]; // DRAFT

    const translated = translateStageConfig(stage, t);

    expect(translated.label).toBe("label:DRAFT.label");
    expect(translated.shortLabel).toBe("label:DRAFT.shortLabel");
    expect(translated.description).toBe("label:DRAFT.description");
    expect(translated.nextAction).toBe("label:DRAFT.nextAction");
  });

  it("deve omitir nextAction para estágios sem ação seguinte", () => {
    const translated = translateStageConfig(cancelledStage, t);

    expect(translated.nextAction).toBeUndefined();
  });

  it("deve traduzir lista de estágios", () => {
    const result = translateStageConfigs(operationalStages, t);

    expect(result).toHaveLength(operationalStages.length);
    expect(result[0].key).toBe("PLANNED");
  });

  it("deve encontrar estágio traduzido por status", () => {
    const found = findTranslatedStage("ON_HOLD", t);

    expect(found?.key).toBe(onHoldStage.key);
    expect(found?.label).toBe("label:ON_HOLD.label");
  });

  it("deve retornar undefined para status desconhecido", () => {
    expect(findTranslatedStage("INVALID" as never, t)).toBeUndefined();
  });

  it("deve mapear categorias do pipeline por status", () => {
    expect(PIPELINE_CATEGORY_BY_STATUS.IN_PROGRESS).toBe("inProgress");
    expect(PIPELINE_CATEGORY_BY_STATUS.COMPLETED).toBe("completed");
    expect(PIPELINE_CATEGORY_BY_STATUS.PROPOSAL).toBe("negotiation");
    expect(PIPELINE_CATEGORY_BY_STATUS.ON_HOLD).toBe("paused");
    expect(PIPELINE_CATEGORY_BY_STATUS.DRAFT).toBe("notStarted");
    expect(PIPELINE_CATEGORY_BY_STATUS.MAINTENANCE).toBe("completed");
    expect(PIPELINE_CATEGORY_BY_STATUS.CANCELLED).toBe("paused");
  });

  it("deve incluir estágios pós-projeto e cancelado na lista completa", () => {
    expect(allStages.some((s) => s.key === postProjectStage.key)).toBe(true);
    expect(allStages.some((s) => s.key === cancelledStage.key)).toBe(true);
  });
});
