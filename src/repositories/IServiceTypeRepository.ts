import { PrismaToPlain } from "@/@types/PrismaToPlain";
import { ServiceCategory, ServiceType } from "@/generated/prisma/client";

export interface CreateServiceDTO {
  organizationId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  basePrice?: number | null;
  active?: boolean;
}

export type FetchServiceTypeWithCategory = PrismaToPlain<ServiceType> & {
  category: ServiceCategory;
};

export interface IServiceTypeRepository {
  create(data: CreateServiceDTO): Promise<PrismaToPlain<ServiceType>>;
  update(
    id: string,
    data: Partial<CreateServiceDTO>,
  ): Promise<PrismaToPlain<ServiceType>>;
  list(query?: string | null): Promise<FetchServiceTypeWithCategory[]>;
  findByName(
    name: string,
    organizationId: string,
  ): Promise<PrismaToPlain<ServiceType> | null>;
  findById(
    id: string,
    organizationId: string,
  ): Promise<FetchServiceTypeWithCategory | null>;
  findManyByIds(
    serviceIds: string[],
    organizationId: string,
  ): Promise<PrismaToPlain<ServiceType>[]>;
  delete(id: string): Promise<void>;
}
