// repositories/prisma/PrismaInvoiceRepository.ts
import { prisma } from "@/lib/prisma";
import { IInvoiceRepository, InvoiceWithDetails } from "../IInvoiceRepository";
import { FinancialStatus, Invoice, Prisma } from "@/generated/prisma/client";
import { normalizePrisma } from "@/utils/normalizePrisma";
import { PrismaToPlain } from "@/@types/PrismaToPlain";

export class PrismaInvoiceRepository implements IInvoiceRepository {
  async create(
    data: Prisma.InvoiceUncheckedCreateInput
  ): Promise<PrismaToPlain<Invoice>> {
    const invoice = await prisma.invoice.create({
      data,
    });

    return normalizePrisma(invoice);
  }

  async findById(id: string): Promise<InvoiceWithDetails | null> {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
      },
    });

    if (!invoice) return null;

    return normalizePrisma(invoice);
  }

  async findByProjectId(projectId: string): Promise<InvoiceWithDetails[]> {
    const invoices = await prisma.invoice.findMany({
      where: { projectId },
      orderBy: { dueDate: "desc" },
      include: {
        client: true,
        project: true,
      },
    });

    return invoices.map(normalizePrisma);
  }

  async update(
    id: string,
    data: Prisma.InvoiceUncheckedUpdateInput
  ): Promise<PrismaToPlain<Invoice>> {
    const invoice = await prisma.invoice.update({
      where: { id },
      data,
    });

    return normalizePrisma(invoice);
  }

  async updateStatus(
    id: string,
    status: FinancialStatus,
    finalPaidAt: Date | null
  ): Promise<PrismaToPlain<Invoice>> {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: finalPaidAt, // Atualiza a data de pagamento (ou limpa se for null)
      },
    });

    return normalizePrisma(invoice);
  }

  async delete(id: string): Promise<void> {
    await prisma.invoice.delete({
      where: { id },
    });
  }
}
