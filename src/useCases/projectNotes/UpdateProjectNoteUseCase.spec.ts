import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BusinessRuleError } from "../../errors/BusinessRuleError";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import { date } from "../../lib/dayjs";
import { InMemoryProjectNotesRepository } from "../../repositories/in-memory/InMemoryProjectNotesRepository";
import { UpdateProjectNoteUseCase } from "./UpdateProjectNoteUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let projectNotesRepository: InMemoryProjectNotesRepository;
let sut: UpdateProjectNoteUseCase;

describe("UpdateProjectNoteUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectNotesRepository = new InMemoryProjectNotesRepository();
    sut = new UpdateProjectNoteUseCase(projectNotesRepository);
  });

  async function seedNote(userId: string, organizationId: string) {
    const projectId = randomUUID();

    projectNotesRepository.users.push({
      id: userId,
      name: "Ana",
      email: "ana@zofia.com",
      emailVerified: null,
      image: null,
      passwordHash: "hash",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as (typeof projectNotesRepository.users)[number]);

    projectNotesRepository.projects.push({
      id: projectId,
      organizationId,
      clientId: randomUUID(),
      name: "Projeto Alpha",
      slug: "projeto-alpha",
      description: null,
      status: "DRAFT",
      priority: "MEDIUM",
      health: "ON_TRACK",
      tags: [],
      estimatedStartDate: null,
      startDate: null,
      endDate: null,
      totalBudget: 0,
      totalSpent: 0,
      remainingBudget: 0,
      createdBy: userId,
      memberId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      client: { slug: "acme" },
    });

    const note = await projectNotesRepository.create({
      content: "Nota original",
      projectId,
      userId,
    });

    return { note, projectId };
  }

  it("deve atualizar observação dentro do prazo de edição", async () => {
    const userId = randomUUID();
    const organizationId = randomUUID();
    const { note, projectId } = await seedNote(userId, organizationId);

    await sut.execute({
      id: note.id,
      content: "Nota atualizada",
      projectId,
      userId,
    });

    expect(projectNotesRepository.items[0].content).toBe("Nota atualizada");
  });

  it("não deve atualizar observação inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        content: "X",
        projectId: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("não deve atualizar observação de outro usuário", async () => {
    const userId = randomUUID();
    const organizationId = randomUUID();
    const { note, projectId } = await seedNote(userId, organizationId);

    await expect(() =>
      sut.execute({
        id: note.id,
        content: "Tentativa",
        projectId,
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("não deve atualizar observação após prazo de edição", async () => {
    const userId = randomUUID();
    const organizationId = randomUUID();
    const { note, projectId } = await seedNote(userId, organizationId);

    const expiredAt = date().subtract(61, "minute").toDate();
    const noteIndex = projectNotesRepository.items.findIndex(
      (item) => item.id === note.id,
    );
    projectNotesRepository.items[noteIndex].createdAt = expiredAt;
    projectNotesRepository.items[noteIndex].updatedAt = expiredAt;

    await expect(() =>
      sut.execute({
        id: note.id,
        content: "Tentativa tardia",
        projectId,
        userId,
      }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("não deve editar observação de outro projeto", async () => {
    const userId = randomUUID();
    const organizationId = randomUUID();
    const { note } = await seedNote(userId, organizationId);

    await expect(() =>
      sut.execute({
        id: note.id,
        content: "Tentativa inválida",
        projectId: randomUUID(),
        userId,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
