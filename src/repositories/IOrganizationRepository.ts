import { DocumentInput } from "@/@types/DocumentInput";
import {
  Organization,
  IndustryType,
  CustomRole,
  LoginHistory,
  Role,
  Member,
  MemberRole,
} from "@/generated/prisma/client";
import { UserSafe } from "./IUsersRepository";

export interface ICreateOrganizationDTO {
  name: string;
  slug: string;
  cnpj?: string; // Opcional no schema
  industry?: IndustryType; // Opcional (tem default)
  logoUrl?: string; // Para upload da Logo
}

export interface IUpdateOrganizationDTO {
  id: string;
  name?: string;
  slug?: string;
  cnpj?: string;
  industry?: IndustryType;
  file?: string; // Para atualização da Logo
}

export type CustomRoleWithUsage = CustomRole & {
  _count: { members: number };
};

export type OrganizationWithStats = Organization & {
  totalOfMembers: number;
  totalOfCustomRoles: number;
  totalOfProjects: number;
};

// Tipo de retorno rico para a tabela de membros
export type OrganizationMember = Member & {
  customRole: CustomRole | null;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  loginHistories: LoginHistory[];
};

export interface ICreateCustomRoleDTO {
  organizationId: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface IUpdateCustomRoleDTO {
  id: string; // ID do Role
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface IOrganizationsRepository {
  create(
    data: ICreateOrganizationDTO,
    document?: DocumentInput,
  ): Promise<Organization>;

  update(
    data: IUpdateOrganizationDTO,
    document?: DocumentInput,
  ): Promise<Organization>;

  delete(id: string): Promise<void>;

  findById(id: string): Promise<OrganizationWithStats | null>;

  findBySlug(slug: string): Promise<OrganizationWithStats | null>;

  findByCnpj(cnpj: string): Promise<OrganizationWithStats | null>;

  /**
   * Busca organizações (Útil para painel Super Admin ou listagem geral)
   * @param query Termo de busca (nome, slug ou cnpj)
   */
  fetchOrganizations(query?: string | null): Promise<Organization[]>;

  findMembers(organizationId: string): Promise<OrganizationMember[]>;

  findMemberByMemberId(
    memberId: string,
    organizationId: string,
  ): Promise<OrganizationMember | null>;

  updateMemberCustomRole(memberId: string, customRoleId: string): Promise<void>;

  updateMemberRole(memberId: string, role: MemberRole): Promise<void>;

  removeMemberFromOrganization(
    memberId: string,
    organizationId: string,
  ): Promise<void>;

  updateMemberSpecificPermissions(
    memberId: string,
    permissions: string[],
  ): Promise<OrganizationMember>;

  findCustomRoles(organizationId: string): Promise<CustomRoleWithUsage[]>;

  deleteCustomRole(roleId: string): Promise<void>;

  createCustomRole(data: ICreateCustomRoleDTO): Promise<CustomRole>;

  updateCustomRole(data: IUpdateCustomRoleDTO): Promise<CustomRole>;

  findCustomRoleById(id: string): Promise<CustomRole | null>;
}
