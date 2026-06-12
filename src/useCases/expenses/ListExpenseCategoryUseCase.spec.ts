import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryExpenseCategoryRepository } from "../../repositories/in-memory/InMemoryExpenseCategoryRepository";
import { ListExpenseCategoryUseCase } from "./ListExpenseCategoryUseCase";

let expenseCategoryRepository: InMemoryExpenseCategoryRepository;
let sut: ListExpenseCategoryUseCase;

describe("ListExpenseCategoryUseCase", () => {
  beforeEach(() => {
    expenseCategoryRepository = new InMemoryExpenseCategoryRepository();
    sut = new ListExpenseCategoryUseCase(expenseCategoryRepository);
  });

  it("deve listar categorias da organização", async () => {
    const organizationId = randomUUID();

    await expenseCategoryRepository.create({
      organizationId,
      name: "Marketing",
    });
    await expenseCategoryRepository.create({
      organizationId,
      name: "Infra",
    });

    const { expenseCategories } = await sut.execute({ organizationId });

    expect(expenseCategories).toHaveLength(2);
    expect(expenseCategories.map((c) => c.name)).toEqual(
      expect.arrayContaining(["Marketing", "Infra"]),
    );
  });

  it("deve retornar lista vazia quando não houver categorias", async () => {
    const { expenseCategories } = await sut.execute({
      organizationId: randomUUID(),
    });

    expect(expenseCategories).toEqual([]);
  });
});
