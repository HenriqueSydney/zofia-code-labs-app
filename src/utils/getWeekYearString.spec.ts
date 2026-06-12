import { describe, expect, it } from "vitest";
import { date } from "../lib/dayjs";
import { getWeekYearString } from "./getWeekYearString";

describe("getWeekYearString", () => {
  it("deve retornar semana e ano formatados com zero à esquerda", () => {
    const fixed = date("2024-01-15"); // semana ISO 03 de 2024

    expect(getWeekYearString(fixed)).toBe("03/2024");
  });

  it("deve usar data atual quando não informada", () => {
    const now = date();
    const week = String(now.isoWeek()).padStart(2, "0");
    const year = now.year();

    expect(getWeekYearString()).toBe(`${week}/${year}`);
  });
});
