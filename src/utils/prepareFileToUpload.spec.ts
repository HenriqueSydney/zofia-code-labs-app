import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExternalServiceError, ValidationError } from "../errors";
import { prepareFileToUpload } from "./prepareFileToUpload";

function createMockFile(
  name: string,
  type: string,
  content = "conteudo-teste",
  sizeOverride?: number,
) {
  const file = new File([content], name, { type });
  if (sizeOverride !== undefined) {
    Object.defineProperty(file, "size", { value: sizeOverride });
  }
  file.arrayBuffer = vi.fn().mockResolvedValue(new TextEncoder().encode(content).buffer);
  return file;
}

describe("prepareFileToUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve preparar arquivo válido com buffer e key sanitizada", async () => {
    const file = createMockFile("Logo Empresa.png", "image/png");

    const result = await prepareFileToUpload({
      file,
      folderName: "clientLogo",
    });

    expect(result.mimeType).toBe("image/png");
    expect(result.extension).toBe("png");
    expect(result.originalName).toBe("Logo Empresa.png");
    expect(result.key).toMatch(/^clientLogo\/\d+-Logo-Empresa\.png$/);
    expect(result.buffer.length).toBeGreaterThan(0);
  });

  it("não deve aceitar objeto que não seja File", async () => {
    await expect(() =>
      prepareFileToUpload({
        file: {} as File,
        folderName: "docs",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("não deve aceitar arquivo acima do limite de tamanho", async () => {
    const file = createMockFile("grande.pdf", "application/pdf", "x", 6 * 1024 * 1024);

    await expect(() =>
      prepareFileToUpload({
        file,
        folderName: "docs",
        options: { maxSizeInMB: 5 },
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("não deve aceitar MIME type não permitido", async () => {
    const file = createMockFile("script.exe", "application/x-msdownload");

    await expect(() =>
      prepareFileToUpload({ file, folderName: "docs" }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("deve lançar ExternalServiceError quando buffer estiver vazio (ValidationError é reempacotada)", async () => {
    const file = createMockFile("vazio.png", "image/png", "");
    file.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(0));

    await expect(() =>
      prepareFileToUpload({ file, folderName: "docs" }),
    ).rejects.toBeInstanceOf(ExternalServiceError);
  });

  it("deve lançar ExternalServiceError quando arrayBuffer falhar", async () => {
    const file = createMockFile("erro.png", "image/png");
    file.arrayBuffer = vi.fn().mockRejectedValue(new Error("read fail"));

    await expect(() =>
      prepareFileToUpload({ file, folderName: "docs" }),
    ).rejects.toBeInstanceOf(ExternalServiceError);
  });
});
