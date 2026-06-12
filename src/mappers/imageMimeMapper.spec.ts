import { describe, expect, it } from "vitest";
import { imageMimeMapper } from "./imageMimeMapper";

describe("imageMimeMapper", () => {
  it("deve mapear extensões comuns para MIME types", () => {
    expect(imageMimeMapper.jpg).toBe("image/jpeg");
    expect(imageMimeMapper.jpeg).toBe("image/jpeg");
    expect(imageMimeMapper.png).toBe("image/png");
    expect(imageMimeMapper.webp).toBe("image/webp");
    expect(imageMimeMapper.svg).toBe("image/svg+xml");
    expect(imageMimeMapper.pdf).toBe("application/pdf");
  });

  it("deve mapear formatos raw de câmera", () => {
    expect(imageMimeMapper.cr2).toBe("image/x-canon-cr2");
    expect(imageMimeMapper.nef).toBe("image/x-nikon-nef");
  });

  it("deve usar octet-stream para extensão vazia", () => {
    expect(imageMimeMapper[""]).toBe("application/octet-stream");
  });
});
