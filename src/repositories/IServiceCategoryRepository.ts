import { Prisma, ServiceCategory } from "@/generated/prisma/client";

export type CreateServiceCategoryDTO = ServiceCategory;

export interface IServiceCategoryRepository {
  create(
    data: Prisma.ServiceCategoryUncheckedCreateInput
  ): Promise<ServiceCategory>;
  update(
    id: string,
    data: Partial<Prisma.ServiceCategoryUncheckedCreateInput>
  ): Promise<ServiceCategory>;
  list(query?: string | null): Promise<ServiceCategory[]>;
  findByName(
    name: string,
    organizationId: string
  ): Promise<ServiceCategory | null>;
  findById(id: string, organizationId: string): Promise<ServiceCategory | null>;
  delete(id: string): Promise<void>;
}
