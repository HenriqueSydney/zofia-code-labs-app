import { randomUUID } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BusinessRuleError } from "../../errors/BusinessRuleError";
import { ResourceNotFoundError } from "../../errors/ResourceNotFoundError";
import { ValidationError } from "../../errors/ValidationError";
import { date } from "../../lib/dayjs";
import { InMemoryProjectNotesRepository } from "../../repositories/in-memory/InMemoryProjectNotesRepository";
import { RemoveProjectNoteUseCase } from "./RemoveProjectNoteUseCase";

vi.mock("../../lib/auth/checkUserPermissionForAsset", () => ({
  checkUserPermissionForAsset: vi.fn().mockResolvedValue(undefined),
}));

let projectNotesRepository: InMemoryProjectNotesRepository;
let sut: RemoveProjectNoteUseCase;

describe("RemoveProjectNoteUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectNotesRepository = new InMemoryProjectNotesRepository();
    sut = new RemoveProjectNoteUseCase(projectNotesRepository);
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
      content: "Nota para remover",
      projectId,
      userId,
    });

    return { note, projectId };
  }

  it("deve remover observação dentro do prazo", async () => {
    const userId = randomUUID();
    const organizationId = randomUUID();
    const { note, projectId } = await seedNote(userId, organizationId);

    const removed = await sut.execute({
      id: note.id,
      projectId,
      userId,
    });

    expect(removed.id).toBe(note.id);
    expect(projectNotesRepository.items).toHaveLength(0);
  });

  it("não deve remover observação inexistente", async () => {
    await expect(() =>
      sut.execute({
        id: randomUUID(),
        projectId: randomUUID(),
        userId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("não deve remover observação com projectId incorreto", async () => {
    const userId = randomUUID();
    const organizationId = randomUUID();
    const { note } = await seedNote(userId, organizationId);

    await expect(() =>
      sut.execute({
        id: note.id,
        projectId: randomUUID(),
        userId,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("não deve remover observação após prazo de remoção", async () => {
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
        projectId,
        userId,
      }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("deve remover observação usando createdAt quando updatedAt não existe", async () => {
    const userId = randomUUID();
    const organizationId = randomUUID();
    const { note, projectId } = await seedNote(userId, organizationId);

    const noteIndex = projectNotesRepository.items.findIndex(
      (item) => item.id === note.id,
    );
    projectNotesRepository.items[noteIndex].updatedAt = null as never;
    projectNotesRepository.items[noteIndex].createdAt = date().subtract(
      10,
      "minute",
    ).toDate();

    const removed = await sut.execute({
      id: note.id,
      projectId,
      userId,
    });

    expect(removed.id).toBe(note.id);
    expect(projectNotesRepository.items).toHaveLength(0);
  });
});
