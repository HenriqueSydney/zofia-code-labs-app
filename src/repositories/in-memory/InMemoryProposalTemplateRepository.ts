import { randomUUID } from "node:crypto";

import { Prisma, ProposalTemplate } from "../../generated/prisma/client";
import { date } from "../../lib/dayjs";
import {
  CreateProposalTemplateDTO,
  IProposalTemplateRepository,
  ProposalTemplateWithDetails,
  UpdateProposalTemplateDTO,
} from "../IProposalTemplateRepository";

export class InMemoryProposalTemplateRepository
  implements IProposalTemplateRepository
{
  public items: ProposalTemplate[] = [];

  async create(
    data: CreateProposalTemplateDTO,
    _tx?: Prisma.TransactionClient,
  ): Promise<ProposalTemplate> {
    const now = date().toDate();

    const template: ProposalTemplate = {
      id: randomUUID(),
      proposalId: data.proposalId,
      content: (data.content ?? null) as ProposalTemplate["content"],
      isDefault: false,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(template);

    return template;
  }

  async update(
    id: string,
    data: UpdateProposalTemplateDTO,
  ): Promise<ProposalTemplate> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error("ProposalTemplate not found");
    }

    if (data.isDefault === true) {
      for (const item of this.items) {
        if (item.id !== id && item.isDefault) {
          item.isDefault = false;
          item.updatedAt = date().toDate();
        }
      }
    }

    const current = this.items[index];
    const updated: ProposalTemplate = {
      ...current,
      proposalId: data.proposalId ?? current.proposalId,
      content: (data.content ?? current.content) as ProposalTemplate["content"],
      isDefault: data.isDefault ?? current.isDefault,
      isActive: data.isActive ?? current.isActive,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;

    return updated;
  }

  async findById(id: string): Promise<ProposalTemplateWithDetails | null> {
    return this.items.find((entry) => entry.id === id) ?? null;
  }

  async findAllActive(): Promise<ProposalTemplateWithDetails[]> {
    return this.items
      .filter((item) => item.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findDefault(): Promise<ProposalTemplateWithDetails | null> {
    return (
      this.items.find((entry) => entry.isDefault && entry.isActive) ?? null
    );
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
