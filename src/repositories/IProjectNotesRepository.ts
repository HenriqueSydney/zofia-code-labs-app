import { Pagination } from "@/@types/Pagination";
import { PrismaToPlain } from "@/@types/PrismaToPlain";
import { Prisma, Project, ProjectNote, User } from "@/generated/prisma/client";

export type ProjectNotesWithDetails = ProjectNote & {
  user: Omit<User, "passwordHash">;
  project: Project & {
    client: { slug: string };
  };
};

export interface IProjectNotesRepository {
  create(
    data: Prisma.ProjectNoteUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<ProjectNote>;
  update(
    id: string,
    data: Partial<Prisma.ProjectNoteUncheckedCreateInput>,
  ): Promise<ProjectNote>;
  delete(id: string): Promise<void>;
  findProjectNoteById(
    id: string,
  ): Promise<PrismaToPlain<ProjectNotesWithDetails> | null>;
  fetchProjectNotesByProjectId(
    projectId: string,
    query?: string | null,
    pagination?: Pagination,
  ): Promise<{
    totalOfRegisters: number;
    projectNotes: PrismaToPlain<ProjectNotesWithDetails>[];
  }>;
}
