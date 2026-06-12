import { describe, expect, it } from "vitest";
import {
  COMMON_IMAGE_EXTENSIONS,
  extensionToMime,
  IMAGE_ACCEPT_STRING,
  mimeToAllExtensions,
  mimeToExtension,
  SUPPORTED_IMAGE_EXTENSIONS,
  SUPPORTED_IMAGE_MIME_TYPES,
} from "./imageExtensionMapper";

describe("imageExtensionMapper", () => {
  it("deve incluir extensões comuns suportadas", () => {
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain("png");
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain("jpg");
    expect(COMMON_IMAGE_EXTENSIONS).toContain("webp");
  });

  it("deve mapear MIME type para extensão padrão", () => {
    expect(mimeToExtension("image/png")).toBe(".png");
    expect(mimeToExtension("image/jpeg")).toBe(".jpe");
    expect(mimeToExtension("application/pdf")).toBe(".pdf");
  });

  it("deve retornar string de accept para image/*", () => {
    const result = mimeToExtension("image/*");

    expect(result).toContain(".png");
    expect(result).toContain(".jpg");
  });

  it("deve retornar vazio para MIME desconhecido", () => {
    expect(mimeToExtension("application/unknown")).toBe("");
  });

  it("deve retornar todas as extensões para um MIME type", () => {
    const extensions = mimeToAllExtensions("image/jpeg");

    expect(extensions).toContain(".jpg");
    expect(extensions).toContain(".jpeg");
  });

  it("deve resolver MIME a partir da extensão", () => {
    expect(extensionToMime("png")).toBe("image/png");
    expect(extensionToMime(".svg")).toBe("image/svg+xml");
    expect(extensionToMime("unknown")).toBe("");
  });

  it("deve gerar strings de accept para inputs de arquivo", () => {
    expect(IMAGE_ACCEPT_STRING).toContain(".png");
    expect(SUPPORTED_IMAGE_MIME_TYPES).toContain("image/png");
  });
});
