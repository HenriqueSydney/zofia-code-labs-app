import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExpenseStatus } from "../../generated/prisma/enums";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { InMemoryExpenseRepository } from "../../repositories/in-memory/InMemoryExpenseRepository";
import { InMemoryProjectsRepository } from "../../repositories/in-memory/InMemoryProjectsRepository";
import { CreateExpenseUseCase } from "./CreateExpenseUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let expenseRepository: InMemoryExpenseRepository;
let projectsRepository: InMemoryProjectsRepository;
let sut: CreateExpenseUseCase;

describe("CreateExpenseUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    expenseRepository = new InMemoryExpenseRepository();
    projectsRepository = new InMemoryProjectsRepository();
    sut = new CreateExpenseUseCase(expenseRepository, projectsRepository);
  });

  it("deve criar despesa vinculada ao projeto", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();
    const expenseCategoryId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
    });

    await projectsRepository.create({
      name: "Projeto Beta",
      description: "Desc",
      slug: "projeto-beta",
      clientId,
      createdBy: userId,
      organizationId,
    });

    await sut.execute({
      userId,
      projectSlug: "projeto-beta",
      expenseCategoryId,
      description: "Licença JetBrains",
      amount: 1200,
      status: ExpenseStatus.PENDING,
    });

    expect(expenseRepository.items).toHaveLength(1);
    expect(expenseRepository.items[0].description).toBe("Licença JetBrains");
    expect(expenseRepository.items[0].organizationId).toBe(organizationId);
  });

  it("não deve criar despesa para projeto inexistente", async () => {
    await expect(() =>
      sut.execute({
        userId: randomUUID(),
        projectSlug: "inexistente",
        expenseCategoryId: randomUUID(),
        description: "X",
        amount: 100,
        status: ExpenseStatus.PENDING,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("deve criar despesa com datas e meta opcionais", async () => {
    const organizationId = randomUUID();
    const userId = randomUUID();
    const clientId = randomUUID();

    projectsRepository.clients.push({
      id: clientId,
      companyName: "Acme",
      slug: "acme",
      tradeName: "Acme",
    });

    await projectsRepository.create({
      name: "Projeto Beta",
      description: "Desc",
      slug: "projeto-beta",
      clientId,
      createdBy: userId,
      organizationId,
    });

    await sut.execute({
      userId,
      projectSlug: "projeto-beta",
      expenseCategoryId: randomUUID(),
      description: "Servidor",
      amount: 800,
      status: ExpenseStatus.PENDING,
      date: "2026-05-01",
      dueDate: "2026-05-15",
      meta: { invoice: "NF-123" },
    });

    expect(expenseRepository.items[0].date).toBeInstanceOf(Date);
    expect(expenseRepository.items[0].dueDate).toBeInstanceOf(Date);
    expect(expenseRepository.items[0].meta).toEqual({ invoice: "NF-123" });
  });
});
