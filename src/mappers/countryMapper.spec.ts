import { describe, expect, it } from "vitest";
import { countriesMap } from "./countryMapper";

describe("countryMapper", () => {
  it("deve conter Brasil e Estados Unidos", () => {
    expect(countriesMap.BR).toBe("Brasil");
    expect(countriesMap.US).toBe("Estados Unidos");
  });

  it("deve conter fallback para país desconhecido", () => {
    expect(countriesMap.unknown).toBe("Desconhecido");
  });

  it("deve retornar undefined para código inexistente", () => {
    expect(countriesMap.XX).toBeUndefined();
  });
});
