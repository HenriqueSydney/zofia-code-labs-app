import { describe, expect, it } from "vitest";
import {
  BACKLOG_PRIORITY_TRANSLATION_KEYS,
  BACKLOG_STATUS_TRANSLATION_KEYS,
  backlogPriorityArray,
  backlogStatusArray,
  getBacklogPriorityLabel,
  getBacklogPriorityOptions,
  getBacklogStatusLabel,
  getBacklogStatusOptions,
} from "./BacklogMappers";

describe("BacklogMappers", () => {
  const t = (key: string) => `tr:${key}`;

  it("deve retornar label traduzido para prioridade", () => {
    expect(getBacklogPriorityLabel("HIGH", t)).toBe("tr:HIGH");
  });

  it("deve retornar label traduzido para status", () => {
    expect(getBacklogStatusLabel("IN_PROGRESS", t)).toBe("tr:inProgress");
  });

  it("deve gerar opções de prioridade com value e label", () => {
    const options = getBacklogPriorityOptions(t);

    expect(options).toHaveLength(
      Object.keys(BACKLOG_PRIORITY_TRANSLATION_KEYS).length,
    );
    expect(options.find((o) => o.value === "URGENT")?.label).toBe("tr:URGENT");
  });

  it("deve gerar opções de status com value e label", () => {
    const options = getBacklogStatusOptions(t);

    expect(options).toHaveLength(
      Object.keys(BACKLOG_STATUS_TRANSLATION_KEYS).length,
    );
    expect(options.find((o) => o.value === "DONE")?.label).toBe("tr:done");
  });

  it("deve expor arrays com todos os status e prioridades", () => {
    expect(backlogStatusArray).toContain("TODO");
    expect(backlogPriorityArray).toContain("LOW");
  });
});
