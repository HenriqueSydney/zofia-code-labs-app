import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExpenseStatus } from "../../generated/prisma/enums";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryExpenseRepository } from "../../repositories/in-memory/InMemoryExpenseRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { UpdateExpenseStatusUseCase } from "./UpdateExpenseStatusUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let expenseRepository: InMemoryExpenseRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: UpdateExpenseStatusUseCase;

describe("UpdateExpenseStatusUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    expenseRepository = new InMemoryExpenseRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new UpdateExpenseStatusUseCase(expenseRepository, projectsRepository);
  });

  it("deve atualizar status da despesa", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const paidAt = new Date("2026-05-01");

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
      status: ExpenseStatus.PAID,
      paidAt,
    });

    expect(expenseRepository.items[0].status).toBe(ExpenseStatus.PAID);
  });

  it("não deve atualizar status de despesa inexistente", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        expenseId: randomUUID(),
        status: ExpenseStatus.PAID,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("não deve atualizar status quando projeto vinculado não existe", async () => {
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
        status: ExpenseStatus.PAID,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
