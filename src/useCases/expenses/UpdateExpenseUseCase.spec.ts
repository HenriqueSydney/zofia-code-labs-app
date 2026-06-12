import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryExpenseRepository } from "../../repositories/in-memory/InMemoryExpenseRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { UpdateExpenseUseCase } from "./UpdateExpenseUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let expenseRepository: InMemoryExpenseRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: UpdateExpenseUseCase;

describe("UpdateExpenseUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    expenseRepository = new InMemoryExpenseRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new UpdateExpenseUseCase(expenseRepository, projectsRepository);
  });

  it("deve atualizar despesa existente", async () => {
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
      description: "Antiga",
      amount: 100,
    });

    await sut.execute({
      userId,
      expenseId: expense.id,
      data: { description: "Atualizada", amount: 250 },
    });

    expect(expenseRepository.items[0].description).toBe("Atualizada");
    expect(expenseRepository.items[0].amount.toNumber()).toBe(250);
  });

  it("não deve atualizar despesa inexistente", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        expenseId: randomUUID(),
        data: { description: "X" },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("não deve atualizar despesa quando projeto vinculado não existe", async () => {
    const expense = await expenseRepository.create({
      organizationId: randomUUID(),
      projectId: randomUUID(),
      expenseCategoryId: randomUUID(),
      description: "Órfã",
      amount: 100,
    });

    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        expenseId: expense.id,
        data: { description: "X" },
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve manter status atual quando update não informar status", async () => {
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
      description: "Fornecedor",
      amount: 300,
    });

    await sut.execute({
      userId,
      expenseId: expense.id,
      data: {
        supplier: "AWS",
        date: "2026-05-10",
        dueDate: "2026-05-20",
      },
    });

    expect(expenseRepository.items[0].supplier).toBe("AWS");
    expect(expenseRepository.items[0].date).toBeInstanceOf(Date);
    expect(expenseRepository.items[0].dueDate).toBeInstanceOf(Date);
  });
});
