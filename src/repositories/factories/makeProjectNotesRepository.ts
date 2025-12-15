import { IProjectNotesRepository } from "../IProjectNotesRepository";
import { PrismaProjectNotesRepository } from "../prisma/PrismaProjectNotesRepository";

let projectNotesRepo: IProjectNotesRepository | null = null;

export function makeProjectNotesRepository() {
  if (!projectNotesRepo) {
    projectNotesRepo = new PrismaProjectNotesRepository();
  }
  return projectNotesRepo;
}
