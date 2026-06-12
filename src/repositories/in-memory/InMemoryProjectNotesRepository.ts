import { randomUUID } from "node:crypto";

import { Pagination } from "../../@types/Pagination";
import { PrismaToPlain } from "../../@types/PrismaToPlain";
import { Prisma, Project, ProjectNote, User } from "../../generated/prisma/client";
import { date } from "../../lib/dayjs";
import { getPaginationQuery } from "../../utils/getPaginationQuery";
import {
  IProjectNotesRepository,
  ProjectNotesWithDetails,
} from "../IProjectNotesRepository";

type ProjectWithClientSlug = Project & {
  client: { slug: string };
};

export class InMemoryProjectNotesRepository implements IProjectNotesRepository {
  public items: ProjectNote[] = [];
  public users: User[] = [];
  public projects: ProjectWithClientSlug[] = [];

  async create(
    data: Prisma.ProjectNoteUncheckedCreateInput,
    _tx?: Prisma.TransactionClient,
  ): Promise<ProjectNote> {
    const now = date().toDate();

    const projectNote: ProjectNote = {
      id: randomUUID(),
      content: data.content,
      projectId: data.projectId,
      userId: data.userId,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(projectNote);

    return projectNote;
  }

  async update(
    id: string,
    data: Partial<Prisma.ProjectNoteUncheckedCreateInput>,
  ): Promise<ProjectNote> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error("ProjectNote not found");
    }

    const updated: ProjectNote = {
      ...this.items[index],
      content: data.content ?? this.items[index].content,
      projectId: data.projectId ?? this.items[index].projectId,
      userId: data.userId ?? this.items[index].userId,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;

    return updated;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }

  async findProjectNoteById(
    id: string,
  ): Promise<PrismaToPlain<ProjectNotesWithDetails> | null> {
    const projectNote = this.items.find((item) => item.id === id);

    if (!projectNote) {
      return null;
    }

    return this.toDetails(projectNote);
  }

  async fetchProjectNotesByProjectId(
    projectId: string,
    query?: string | null,
    pagination?: Pagination,
  ): Promise<{
    totalOfRegisters: number;
    projectNotes: PrismaToPlain<ProjectNotesWithDetails>[];
  }> {
    let filtered = this.items.filter((item) => item.projectId === projectId);

    if (query) {
      const normalizedQuery = query.toLowerCase();
      filtered = filtered.filter((item) =>
        item.content.toLowerCase().includes(normalizedQuery),
      );
    }

    filtered = filtered.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    const totalOfRegisters = filtered.length;
    const paginationDef = getPaginationQuery(pagination);
    const skip = "skip" in paginationDef ? (paginationDef.skip as number) : 0;
    const take =
      "take" in paginationDef
        ? (paginationDef.take as number)
        : filtered.length;

    const paginated = filtered.slice(skip, skip + take);
    const projectNotes = paginated
      .map((item) => this.toDetails(item))
      .filter((item): item is PrismaToPlain<ProjectNotesWithDetails> => item !== null);

    return { totalOfRegisters, projectNotes };
  }

  private toDetails(
    projectNote: ProjectNote,
  ): PrismaToPlain<ProjectNotesWithDetails> | null {
    const user = this.users.find((u) => u.id === projectNote.userId);
    const project = this.projects.find((p) => p.id === projectNote.projectId);

    if (!user || !project) {
      return null;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      ...projectNote,
      user: userWithoutPassword,
      project,
    } as PrismaToPlain<ProjectNotesWithDetails>;
  }
}
