import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryExpenseRepository } from "../../repositories/in-memory/InMemoryExpenseRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { ListExpensesUseCase } from "./ListExpensesUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let expenseRepository: InMemoryExpenseRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: ListExpensesUseCase;

describe("ListExpensesUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    expenseRepository = new InMemoryExpenseRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new ListExpensesUseCase(expenseRepository, projectsRepository);
  });

  it("deve listar despesas do projeto", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
    });

    const project = await projectsRepository.create({
      name: "Projeto Beta",
      description: "Desc",
      slug: "projeto-beta",
      clientId,
      createdBy: userId,
      organizationId,
    });

    await expenseRepository.create({
      organizationId,
      projectId: project.id,
      expenseCategoryId: randomUUID(),
      description: "Despesa A",
      amount: 100,
    });

    await expenseRepository.create({
      organizationId,
      projectId: project.id,
      expenseCategoryId: randomUUID(),
      description: "Despesa B",
      amount: 200,
    });

    const result = await sut.execute({
      userId,
      projectSlug: "projeto-beta",
    });

    expect(result.total).toBe(2);
    expect(result.expenses).toHaveLength(2);
  });

  it("não deve listar despesas de projeto inexistente", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        projectSlug: "inexistente",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
