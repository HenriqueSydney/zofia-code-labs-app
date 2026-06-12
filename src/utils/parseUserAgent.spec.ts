import { describe, expect, it } from "vitest";
import { Laptop, Smartphone } from "lucide-react";
import { parseUserAgent } from "./parseUserAgent";

describe("parseUserAgent", () => {
  it("deve retornar desconhecido quando user agent for nulo", () => {
    const result = parseUserAgent(null);

    expect(result.name).toBe("Desconhecido");
    expect(result.icon).toBe(Laptop);
  });

  it("deve detectar Windows e Chrome", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0";

    expect(parseUserAgent(ua).name).toBe("Windows • Chrome");
    expect(parseUserAgent(ua).icon).toBe(Laptop);
  });

  it("deve detectar Linux antes de Android em user agents combinados", () => {
    const ua = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0";

    const result = parseUserAgent(ua);

    expect(result.name).toBe("Linux • Chrome");
    expect(result.icon).toBe(Laptop);
  });

  it("deve detectar MacOS quando UA contém Mac OS X (ex.: iPhone)", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1";

    expect(parseUserAgent(ua).name).toBe("MacOS • Safari");
    expect(parseUserAgent(ua).icon).toBe(Laptop);
  });

  it("deve detectar Android puro com ícone mobile", () => {
    const ua = "Mozilla/5.0 (Android 13; Mobile) AppleWebKit/537.36 Chrome/120.0.0.0";

    const result = parseUserAgent(ua);

    expect(result.name).toBe("Android • Chrome");
    expect(result.icon).toBe(Smartphone);
  });

  it("deve detectar MacOS e Firefox", () => {
    const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15) Gecko/20100101 Firefox/115.0";

    expect(parseUserAgent(ua).name).toBe("MacOS • Firefox");
  });

  it("deve detectar Edge quando UA contém edge", () => {
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0";

    expect(parseUserAgent(ua).name).toBe("Windows • Edge");
  });

  it("deve detectar iOS com ícone mobile quando UA não contém mac", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Mobile/15E148";

    const result = parseUserAgent(ua);

    expect(result.name).toBe("iOS • Navegador");
    expect(result.icon).toBe(Smartphone);
  });
});
