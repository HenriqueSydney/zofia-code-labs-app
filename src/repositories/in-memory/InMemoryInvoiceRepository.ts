import { randomUUID } from "node:crypto";
import { PrismaToPlain } from "@/@types/PrismaToPlain";
import { Client, Invoice, Prisma, Project } from "@/generated/prisma/client";
import { FinancialStatus, InvoiceChargeType } from "@/generated/prisma/enums";
import { date } from "@/lib/dayjs";
import { IInvoiceRepository, InvoiceWithDetails } from "../IInvoiceRepository";

export class InMemoryInvoiceRepository implements IInvoiceRepository {
  public items: Invoice[] = [];
  public clients: Client[] = [];
  public projects: Project[] = [];

  private toPlain(invoice: Invoice): PrismaToPlain<Invoice> {
    return {
      ...invoice,
      amount: Number(invoice.amount),
    };
  }

  private toWithDetails(invoice: Invoice): InvoiceWithDetails | null {
    const client = this.clients.find((entry) => entry.id === invoice.clientId);
    const project = this.projects.find(
      (entry) => entry.id === invoice.projectId,
    );
    if (!client || !project) return null;

    return {
      ...this.toPlain(invoice),
      client,
      project,
    };
  }

  private toDecimal(
    value: Prisma.InvoiceUncheckedCreateInput["amount"],
  ): Invoice["amount"] {
    if (value instanceof Prisma.Decimal) return value;
    return new Prisma.Decimal(Number(value));
  }

  async create(
    data: Prisma.InvoiceUncheckedCreateInput,
  ): Promise<PrismaToPlain<Invoice>> {
    const now = date().toDate();

    const newInvoice: Invoice = {
      id: randomUUID(),
      organizationId: data.organizationId,
      projectId: data.projectId,
      clientId: data.clientId,
      internetBankingProvider: data.internetBankingProvider,
      paymentType: data.paymentType,
      chargeType: data.chargeType ?? InvoiceChargeType.STANDARD,
      amount: this.toDecimal(data.amount),
      dueDate:
        data.dueDate instanceof Date ? data.dueDate : new Date(data.dueDate),
      paidAt:
        data.paidAt instanceof Date
          ? data.paidAt
          : data.paidAt
            ? new Date(data.paidAt)
            : null,
      status: data.status ?? "PENDING",
      description: data.description,
      nfseNumber: data.nfseNumber ?? null,
      nfseLink: data.nfseLink ?? null,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(newInvoice);
    return this.toPlain(newInvoice);
  }

  async findById(id: string): Promise<InvoiceWithDetails | null> {
    const invoice = this.items.find((entry) => entry.id === id);
    if (!invoice) return null;
    return this.toWithDetails(invoice);
  }

  async findByProjectId(projectId: string): Promise<InvoiceWithDetails[]> {
    return this.items
      .filter((invoice) => invoice.projectId === projectId)
      .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
      .map((invoice) => this.toWithDetails(invoice))
      .filter((invoice): invoice is InvoiceWithDetails => invoice !== null);
  }

  async update(
    id: string,
    data: Prisma.InvoiceUncheckedUpdateInput,
  ): Promise<PrismaToPlain<Invoice>> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Invoice not found");
    }

    const current = this.items[index];
    const updates = this.extractScalarUpdates(data);
    const updated: Invoice = {
      ...current,
      ...updates,
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;
    return this.toPlain(updated);
  }

  async updateStatus(
    id: string,
    status: FinancialStatus,
    finalPaidAt: Date | null,
  ): Promise<PrismaToPlain<Invoice>> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Invoice not found");
    }

    const updated: Invoice = {
      ...this.items[index],
      status,
      paidAt: finalPaidAt,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;
    return this.toPlain(updated);
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }

  private extractScalarUpdates(
    data: Prisma.InvoiceUncheckedUpdateInput,
  ): Partial<Invoice> {
    const updates: Partial<Invoice> = {};

    if (typeof data.projectId === "string") {
      updates.projectId = data.projectId;
    }

    if (typeof data.clientId === "string") {
      updates.clientId = data.clientId;
    }

    if (typeof data.internetBankingProvider === "string") {
      updates.internetBankingProvider = data.internetBankingProvider;
    }

    if (typeof data.paymentType === "string") {
      updates.paymentType = data.paymentType;
    }

    if (typeof data.chargeType === "string") {
      updates.chargeType = data.chargeType;
    }

    if (data.amount !== undefined) {
      if (data.amount instanceof Prisma.Decimal) {
        updates.amount = data.amount;
      } else if (
        typeof data.amount === "number" ||
        typeof data.amount === "string"
      ) {
        updates.amount = new Prisma.Decimal(data.amount);
      }
    }

    if (data.dueDate !== undefined) {
      if (data.dueDate instanceof Date) {
        updates.dueDate = data.dueDate;
      } else if (typeof data.dueDate === "string") {
        updates.dueDate = new Date(data.dueDate);
      }
    }

    if (data.paidAt !== undefined) {
      if (data.paidAt instanceof Date) {
        updates.paidAt = data.paidAt;
      } else if (typeof data.paidAt === "string") {
        updates.paidAt = new Date(data.paidAt);
      } else {
        updates.paidAt = null;
      }
    }

    if (typeof data.status === "string") {
      updates.status = data.status;
    }

    if (typeof data.description === "string") {
      updates.description = data.description;
    }

    if (data.nfseNumber !== undefined) {
      updates.nfseNumber =
        typeof data.nfseNumber === "string" ? data.nfseNumber : null;
    }

    if (data.nfseLink !== undefined) {
      updates.nfseLink =
        typeof data.nfseLink === "string" ? data.nfseLink : null;
    }

    return updates;
  }
}
