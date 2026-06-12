import { describe, expect, it } from "vitest";
import { formatBytes } from "./formatBytes";

describe("formatBytes", () => {
  it("deve retornar 0 Bytes para valor zero", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
  });

  it("deve formatar bytes sem unidade maior", () => {
    expect(formatBytes(500)).toBe("500 Bytes");
  });

  it("deve converter para KB com casas decimais padrão", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("deve respeitar quantidade de decimais informada", () => {
    expect(formatBytes(1536, 1)).toBe("1.5 KB");
  });

  it("deve tratar decimais negativos como zero casas", () => {
    expect(formatBytes(2048, -1)).toBe("2 KB");
  });
});
