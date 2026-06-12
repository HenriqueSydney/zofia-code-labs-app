import { describe, expect, it } from "vitest";
import { checkPasswordStrength } from "./checkPasswordStrength";

describe("checkPasswordStrength", () => {
  it("deve classificar senha muito fraca com erros de requisitos", () => {
    const result = checkPasswordStrength("abc");

    expect(result.label).toBe("Muito fraca");
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("deve classificar senha excelente quando atende todos os critérios", () => {
    const result = checkPasswordStrength("Zofia@9xK!");

    expect(result.label).toBe("Excelente");
    expect(result.score).toBe(5);
    expect(result.errors).toHaveLength(0);
  });

  it("deve penalizar sequência óbvia", () => {
    const result = checkPasswordStrength("Abcdef1!");

    expect(result.errors).toContain(
      "Contém sequência óbvia (ex: abc, cba, 123)",
    );
  });

  it("deve penalizar caracteres repetidos", () => {
    const result = checkPasswordStrength("Aaa1111!");

    expect(result.errors).toContain(
      "Contém caracteres repetidos como aaa ou 111",
    );
  });
});
