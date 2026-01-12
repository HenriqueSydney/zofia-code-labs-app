import { PrismaToPlain } from "@/@types/PrismaToPlain";
import { Client, Invoice, Prisma, Project } from "@/generated/prisma/client";
import { FinancialStatus } from "@/generated/prisma/enums";

export type InvoiceWithDetails = PrismaToPlain<Invoice> & {
  client: Client;
  project: Project;
};

export interface IInvoiceRepository {
  create(
    data: Prisma.InvoiceUncheckedCreateInput
  ): Promise<PrismaToPlain<Invoice>>;
  findById(id: string): Promise<InvoiceWithDetails | null>;
  findByProjectId(projectId: string): Promise<InvoiceWithDetails[]>;
  update(
    id: string,
    data: Prisma.InvoiceUncheckedUpdateInput
  ): Promise<PrismaToPlain<Invoice>>;
  delete(id: string): Promise<void>;
  updateStatus(
    id: string,
    status: FinancialStatus,
    finalPaidAt: Date | null
  ): Promise<PrismaToPlain<Invoice>>;
}
