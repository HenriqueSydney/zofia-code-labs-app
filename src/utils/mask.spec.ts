import { describe, expect, it } from "vitest";
import { mask, removeMask, maskFormatters, convertPatternToIMask } from "./mask";

describe("mask", () => {
  it("deve aplicar máscara de CPF sobre dígitos", () => {
    const result = mask("12345678901", "###.###.###-##");

    expect(result).toBe("123.456.789-01");
  });

  it("deve interromper quando a máscara acabar", () => {
    const result = mask("12345", "###.###");

    expect(result).toBe("123.45");
  });

  it("deve inserir caracteres literais da máscara antes dos dígitos", () => {
    const result = mask("1234", "(##) ####");

    expect(result).toBe("(12) 34");
  });
});

describe("removeMask", () => {
  it("deve remover todos os caracteres não numéricos", () => {
    expect(removeMask("12.345.678/0001-99")).toBe("12345678000199");
  });

  it("deve retornar string vazia quando não houver dígitos", () => {
    expect(removeMask("abc")).toBe("");
  });
});

describe("convertPatternToIMask", () => {
  it("deve substituir # por 0 no padrão", () => {
    expect(convertPatternToIMask("##.###.###-##")).toBe("00.000.000-00");
  });
});

describe("maskFormatters", () => {
  it("deve formatar CNPJ", () => {
    expect(maskFormatters.cnpj("12345678000199")).toBe("12.345.678/0001-99");
  });

  it("deve formatar CEP", () => {
    expect(maskFormatters.cep("01310100")).toBe("01310-100");
  });

  it("deve usar máscara de telefone fixo para até 10 dígitos", () => {
    expect(maskFormatters.telefoneDinamico("1133334444")).toBe("(11) 3333-4444");
  });

  it("deve usar máscara de celular para mais de 10 dígitos", () => {
    expect(maskFormatters.telefoneDinamico("11987654321")).toBe("(11) 98765-4321");
  });

  it("deve formatar CPF", () => {
    expect(maskFormatters.cpf("12345678901")).toBe("123.456.789-01");
  });

  it("deve formatar telefone fixo", () => {
    expect(maskFormatters.telefone("1133334444")).toBe("(11) 3333-4444");
  });

  it("deve formatar celular", () => {
    expect(maskFormatters.celular("11987654321")).toBe("(11) 98765-4321");
  });

  it("deve formatar data", () => {
    expect(maskFormatters.data("31052026")).toBe("31/05/2026");
  });
});
