import { Client } from "@/generated/prisma/client";

export interface ICreateClientDTO {
  companyName: string;
  tradeName: string;
  cnpj: string;
  email: string;
  phone: string;
  organizationId: string;
}

export interface IUpdateClientDTO {
  id: string;
  companyName?: string;
  tradeName?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
}

export interface IClientsRepository {
  create(data: ICreateClientDTO): Promise<Client>;
  update(data: IUpdateClientDTO): Promise<Client>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Client | null>;
  findByCnpj(cnpj: string): Promise<Client | null>;
  fetchClients(
    organizationId: string,
    query?: string | null
  ): Promise<Client[]>;
}
