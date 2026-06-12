import { describe, expect, it } from "vitest";
import { getParams } from "./getParams";

describe("getParams", () => {
  it("deve extrair chaves de objeto síncrono", async () => {
    const result = await getParams({ slug: "acme", page: 2 }, ["slug", "page"]);

    expect(result.slug).toBe("acme");
    expect(result.page).toBe("2");
  });

  it("deve resolver promise de params", async () => {
    const result = await getParams(
      Promise.resolve({ client: "zofia", tab: "overview" }),
      ["client", "tab"],
    );

    expect(result.client).toBe("zofia");
    expect(result.tab).toBe("overview");
  });

  it("deve converter array em string separada por vírgula", async () => {
    const result = await getParams({ tags: ["a", "b"] }, ["tags"]);

    expect(result.tags).toBe("a,b");
  });

  it("deve retornar undefined para chaves ausentes", async () => {
    const result = await getParams({}, ["missing"]);

    expect(result.missing).toBeUndefined();
  });
});
