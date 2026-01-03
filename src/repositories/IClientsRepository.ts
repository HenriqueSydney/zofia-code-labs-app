import { DocumentInput } from "@/@types/DocumentInput";
import { Client } from "@/generated/prisma/client";

export interface ICreateClientDTO {
  companyName: string;
  slug: string;
  tradeName: string;
  cnpj: string;
  email: string;
  phone: string;
  organizationId: string;
  file?: File;
}

export interface IUpdateClientDTO {
  id: string;
  companyName?: string;
  tradeName?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  file?: File;
}

export interface IClientsRepository {
  create(data: ICreateClientDTO, document?: DocumentInput): Promise<Client>;
  update(data: IUpdateClientDTO, document?: DocumentInput): Promise<Client>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Client | null>;
  findBySlug(slug: string): Promise<Client | null>;
  findByCnpj(cnpj: string): Promise<Client | null>;
  fetchClients(
    organizationId: string,
    query?: string | null
  ): Promise<Client[]>;
}
