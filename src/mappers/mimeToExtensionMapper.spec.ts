import { describe, expect, it } from "vitest";
import { mimeToExtension } from "./mimeToExtensionMapper";

describe("mimeToExtensionMapper", () => {
  it("deve mapear MIME types conhecidos", () => {
    expect(mimeToExtension("image/jpeg")).toBe(".jpg");
    expect(mimeToExtension("image/png")).toBe(".png");
    expect(mimeToExtension("image/svg+xml")).toBe(".svg");
    expect(mimeToExtension("image/webp")).toBe(".webp");
    expect(mimeToExtension("application/pdf")).toBe(".pdf");
  });

  it("deve retornar vazio para MIME desconhecido", () => {
    expect(mimeToExtension("application/unknown")).toBe("");
  });

  it("deve retornar accept string para image/*", () => {
    const result = mimeToExtension("image/*");

    expect(result).toContain(".png");
    expect(result).toContain(";");
  });
});
