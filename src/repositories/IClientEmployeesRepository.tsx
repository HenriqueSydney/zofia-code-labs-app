import { ClientEmployees, Prisma } from "@/generated/prisma/client";

export type ClientEmployeesWithDetails = ClientEmployees & {
  user: {
    name: string;
    email: string;
    image: string;
    loginHistories: {
      createdAt: Date;
    }[];
  };
};

export interface IClientEmployeesRepository {
  create(
    data: Prisma.ClientEmployeesUncheckedCreateInput
  ): Promise<ClientEmployees>;
  update(
    id: string,
    data: Prisma.ClientEmployeesUncheckedUpdateInput
  ): Promise<ClientEmployees>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<ClientEmployees | null>;
  findByClientAndUser(
    clientId: string,
    userId: string
  ): Promise<ClientEmployees | null>;
  listByClient(clientId: string): Promise<ClientEmployeesWithDetails[]>;
}
