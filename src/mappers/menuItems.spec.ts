import { describe, expect, it } from "vitest";
import { getMenuItems } from "./menuItems";

describe("menuItems", () => {
  it("deve retornar itens de menu com labels traduzidos", () => {
    const t = (key: string) => key.replace("nav.", "").replace(".title", "");

    const items = getMenuItems(t);

    expect(items).toHaveLength(7);
    expect(items[0]).toMatchObject({
      id: "home",
      href: "#home",
      label: "home",
    });
    expect(items.map((i) => i.id)).toEqual([
      "home",
      "services",
      "about",
      "projects",
      "testimonials",
      "faq",
      "contact",
    ]);
  });

  it("deve incluir ariaLabel para cada item", () => {
    const t = (key: string) => key;

    const items = getMenuItems(t);

    expect(items.every((item) => item.ariaLabel.startsWith("nav."))).toBe(true);
  });
});
