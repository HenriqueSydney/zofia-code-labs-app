import { describe, expect, it } from "vitest";
import { generateSlug } from "./generateSlug";

describe("generateSlug", () => {
  it("deve criar slug padrão com remoção de acentos", () => {
    const payload = { title: "Título com Ação e Espaços" };

    const result = generateSlug(payload);

    expect(result).toBe("titulo-com-acao-e-espacos");
  });

  it("deve respeitar maxLength e remover separador final após corte", () => {
    const payload = { title: "um titulo muito longo", options: { maxLength: 8 } };

    const result = generateSlug(payload);

    expect(result).toBe("um-titul");
  });

  it("deve retornar vazio quando título for inválido", () => {
    expect(generateSlug({ title: "" })).toBe("");
    expect(generateSlug({ title: null as unknown as string })).toBe("");
  });

  it("deve manter maiúsculas quando lowercase for false", () => {
    const result = generateSlug({
      title: "Hello World",
      options: { lowercase: false },
    });

    expect(result).toBe("Hello-World");
  });

  it("deve aplicar modo strict removendo caracteres especiais", () => {
    const result = generateSlug({
      title: "Projeto #1 @2024",
      options: { strict: true },
    });

    expect(result).toBe("projeto-1-2024");
  });

  it("deve usar separador customizado", () => {
    const result = generateSlug({
      title: "foo bar",
      options: { separator: "_" },
    });

    expect(result).toBe("foo_bar");
  });
});
