import { describe, expect, it } from "vitest";
import { getServicesDiffMessage } from "./getServicesDiffMessage";

const services = [
  { serviceTypeId: "a", serviceType: { name: "Design" } },
  { serviceTypeId: "b", serviceType: { name: "Dev" } },
];

describe("getServicesDiffMessage", () => {
  it("deve retornar null quando não houver alterações", () => {
    expect(getServicesDiffMessage(services, ["a", "b"])).toBeNull();
  });

  it("deve listar serviços removidos", () => {
    const message = getServicesDiffMessage(services, ["a"]);

    expect(message).toContain("Removidos: Dev");
    expect(message).toContain("Alterações no Escopo de Serviços:");
  });

  it("deve listar serviços adicionados", () => {
    const message = getServicesDiffMessage(services, ["a", "b", "c"]);

    expect(message).toContain("Adicionados: 1 novo(s) serviço(s)");
  });

  it("deve lançar quando currentServices for nulo", () => {
    expect(() =>
      getServicesDiffMessage(null as unknown as typeof services, ["a"]),
    ).toThrow();
  });
});
