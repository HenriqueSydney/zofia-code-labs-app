import { describe, expect, it } from "vitest";
import { objectToSearchParams } from "./objectToSearchParams";

describe("objectToSearchParams", () => {
  it("deve gerar query string com parâmetros definidos", () => {
    const result = objectToSearchParams({ page: 1, search: "foo" });

    expect(result).toBe("?page=1&search=foo");
  });

  it("deve ignorar valores undefined", () => {
    const result = objectToSearchParams({ page: 1, search: undefined });

    expect(result).toBe("?page=1");
  });

  it("deve retornar string vazia quando não houver parâmetros", () => {
    expect(objectToSearchParams({})).toBe("");
    expect(objectToSearchParams({ a: undefined })).toBe("");
  });
});
