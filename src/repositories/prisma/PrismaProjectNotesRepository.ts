import { Pagination } from "@/@types/Pagination";
import { Prisma, ProjectNote } from "@/generated/prisma/client";
import {
  IProjectNotesRepository,
  ProjectNotesWithDetails,
} from "../IProjectNotesRepository";
import { prisma } from "@/lib/prisma";
import { getPaginationQuery } from "@/utils/getPaginationQuery";
import { normalizePrisma } from "@/utils/normalizePrisma";
import { PrismaToPlain } from "@/@types/PrismaToPlain";

export class PrismaProjectNotesRepository implements IProjectNotesRepository {
  async create(
    data: Prisma.ProjectNoteUncheckedCreateInput,
    tx?: Prisma.TransactionClient
  ): Promise<ProjectNote> {
    const client = tx || prisma;

    const projectNote = await client.projectNote.create({
      data,
    });
    return projectNote;
  }

  async update(
    id: string,
    data: Partial<Prisma.ProjectNoteUncheckedCreateInput>
  ): Promise<ProjectNote> {
    return await prisma.projectNote.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.projectNote.delete({
      where: { id },
    });
  }

  async findProjectNoteById(
    id: string
  ): Promise<PrismaToPlain<ProjectNotesWithDetails> | null> {
    const projectNote = await prisma.projectNote.findUnique({
      include: {
        user: {
          omit: {
            passwordHash: true,
          },
        },
        project: true,
      },
      where: { id },
    });

    return normalizePrisma(projectNote);
  }

  async fetchProjectNotesByProjectId(
    projectId: string,
    query?: string | null,
    pagination?: Pagination
  ): Promise<{
    totalOfRegisters: number;
    projectNotes: PrismaToPlain<ProjectNotesWithDetails>[];
  }> {
    const where: Prisma.ProjectNoteWhereInput = query
      ? {
          content: {
            contains: query,
            mode: "insensitive",
          },
          projectId,
        }
      : {
          projectId,
        };

    const paginationDef = pagination ? getPaginationQuery(pagination) : {};
    const [totalOfRegisters, projectNotes] = await Promise.all([
      prisma.projectNote.count({ where }),
      prisma.projectNote.findMany({
        include: {
          user: {
            omit: {
              passwordHash: true,
            },
          },
          project: true,
        },
        ...paginationDef,
        where,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    return { totalOfRegisters, projectNotes: normalizePrisma(projectNotes) };
  }
}
