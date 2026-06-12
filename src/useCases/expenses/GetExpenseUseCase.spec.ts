import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryExpenseRepository } from "../../repositories/in-memory/InMemoryExpenseRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { GetExpenseUseCase } from "./GetExpenseUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let expenseRepository: InMemoryExpenseRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: GetExpenseUseCase;

describe("GetExpenseUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    expenseRepository = new InMemoryExpenseRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new GetExpenseUseCase(expenseRepository, projectsRepository);
  });

  it("deve retornar despesa quando existir", async () => {
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

    const expense = await expenseRepository.create({
      organizationId,
      projectId: project.id,
      expenseCategoryId: randomUUID(),
      description: "Hospedagem",
      amount: 200,
    });

    const result = await sut.execute({ userId, expenseId: expense.id });

    expect(result.description).toBe("Hospedagem");
    expect(result.projectId).toBe(project.id);
  });

  it("não deve retornar despesa inexistente", async () => {
    await expect(() =>
      sut.execute({ userId: randomUUID(), expenseId: randomUUID() }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("não deve retornar despesa quando projeto vinculado não existe", async () => {
    const expense = await expenseRepository.create({
      organizationId: randomUUID(),
      projectId: randomUUID(),
      expenseCategoryId: randomUUID(),
      description: "Órfã",
      amount: 100,
    });

    await expect(() =>
      sut.execute({ userId: randomUUID(), expenseId: expense.id }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
