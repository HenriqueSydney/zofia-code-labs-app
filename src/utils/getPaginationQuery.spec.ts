import { describe, expect, it } from "vitest";
import { getPaginationQuery } from "./getPaginationQuery";

describe("getPaginationQuery", () => {
  it("deve retornar objeto vazio sem paginação", () => {
    expect(getPaginationQuery()).toEqual({});
    expect(getPaginationQuery(undefined)).toEqual({});
  });

  it("deve calcular skip com page e numberPerPage padrão de 10", () => {
    const result = getPaginationQuery({ page: 3 });

    expect(result).toEqual({ skip: 20, take: undefined });
  });

  it("deve calcular skip e take com numberPerPage", () => {
    const result = getPaginationQuery({ numberPerPage: 25 });

    expect(result).toEqual({ skip: 0, take: 25 });
  });

  it("deve priorizar numberPerPage quando page e numberPerPage forem informados", () => {
    const result = getPaginationQuery({ page: 2, numberPerPage: 15 });

    expect(result).toEqual({ skip: 15, take: 15 });
  });

  it("deve converter page e numberPerPage vindos como string (query params)", () => {
    const result = getPaginationQuery({
      page: "2" as unknown as number,
      numberPerPage: "10" as unknown as number,
    });

    expect(result).toEqual({ skip: 10, take: 10 });
  });
});
