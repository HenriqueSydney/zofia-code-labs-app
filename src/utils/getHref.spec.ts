import { describe, expect, it } from "vitest";
import { getHref } from "./getHref";

describe("getHref", () => {
  it("deve retornar href direto na home sem locale no path", () => {
    expect(getHref("pt", "/", "#contato")).toBe("#contato");
  });

  it("deve retornar href direto quando pathname for apenas locale", () => {
    expect(getHref("pt", "/pt", "/sobre")).toBe("/sobre");
  });

  it("deve prefixar locale em páginas internas", () => {
    expect(getHref("pt", "/pt/clients", "/dashboard")).toBe("/pt/dashboard");
  });

  it("deve funcionar com locale en", () => {
    expect(getHref("en", "/en/projects", "/settings")).toBe("/en/settings");
  });
});
