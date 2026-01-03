import { IntegrationType, Prisma } from "@/generated/prisma/client";


export interface IIntegrationTypeRepository {
  create(data: Prisma.IntegrationTypeCreateInput): Promise<IntegrationType>;
  findById(id: string): Promise<IntegrationType | null>;
  findBySlug(slug: string): Promise<IntegrationType | null>;
  listAll(query?: string): Promise<IntegrationType[]>;
  update(
    id: string,
    data: Prisma.IntegrationTypeUpdateInput
  ): Promise<IntegrationType>;
  delete(id: string): Promise<void>;
}
