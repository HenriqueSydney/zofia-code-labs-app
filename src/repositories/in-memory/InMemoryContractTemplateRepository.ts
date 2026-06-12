import { randomUUID } from "node:crypto";

import { Prisma, ContractTemplate } from "../../generated/prisma/client";
import { date } from "../../lib/dayjs";
import {
  CreateContractTemplateDTO,
  IContractTemplateRepository,
  ContractTemplateWithDetails,
  UpdateContractTemplateDTO,
} from "../IContractTemplateRepository";

export class InMemoryContractTemplateRepository
  implements IContractTemplateRepository
{
  public items: ContractTemplate[] = [];

  async create(
    data: CreateContractTemplateDTO,
    _tx?: Prisma.TransactionClient,
  ): Promise<ContractTemplate> {
    const now = date().toDate();

    const template: ContractTemplate = {
      id: randomUUID(),
      contractId: data.contractId,
      content: (data.content ?? null) as ContractTemplate["content"],
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
    data: UpdateContractTemplateDTO,
  ): Promise<ContractTemplate> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error("ContractTemplate not found");
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
    const updated: ContractTemplate = {
      ...current,
      contractId: data.contractId ?? current.contractId,
      content: (data.content ?? current.content) as ContractTemplate["content"],
      isDefault: data.isDefault ?? current.isDefault,
      isActive: data.isActive ?? current.isActive,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;

    return updated;
  }

  async findById(id: string): Promise<ContractTemplateWithDetails | null> {
    return this.items.find((entry) => entry.id === id) ?? null;
  }

  async findAllActive(): Promise<ContractTemplateWithDetails[]> {
    return this.items
      .filter((item) => item.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findDefault(): Promise<ContractTemplateWithDetails | null> {
    return (
      this.items.find((entry) => entry.isDefault && entry.isActive) ?? null
    );
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
