import { prisma } from "@/lib/prisma";
import {
  IOrganizationsRepository,
  ICreateOrganizationDTO,
  IUpdateOrganizationDTO,
  OrganizationWithStats,
  OrganizationMember,
  CustomRoleWithUsage,
  IUpdateCustomRoleDTO,
  ICreateCustomRoleDTO,
} from "../IOrganizationRepository";
import {
  CustomRole,
  LoginHistory,
  Organization,
  Prisma,
  User,
} from "@/generated/prisma/client";
import { DocumentInput } from "@/@types/DocumentInput";

type RawMember = User & {
  customRole: CustomRole | null;
  loginHistories: LoginHistory[];
};

export class PrismaOrganizationsRepository implements IOrganizationsRepository {
  async create(
    data: ICreateOrganizationDTO,
    document?: DocumentInput,
  ): Promise<Organization> {
    const { ...organizationData } = data;

    const organization = await prisma.organization.create({
      data: {
        ...organizationData,
      },
    });
    return organization;
  }

  async update(
    data: IUpdateOrganizationDTO,
    document?: DocumentInput,
  ): Promise<Organization> {
    const { id, file, ...updateData } = data;

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...updateData,
      },
    });
    return organization;
  }

  async delete(id: string): Promise<void> {
    // Como Organization é a entidade raiz, geralmente fazemos Hard Delete
    // A menos que você adicione o campo 'deletedAt' no schema Organization para suportar Soft Delete
    await prisma.organization.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<OrganizationWithStats | null> {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: this.getStatsInclude(),
    });
    if (!organization) return null;

    return this.mapToStats(organization);
  }

  async findBySlug(slug: string): Promise<OrganizationWithStats | null> {
    const organization = await prisma.organization.findUnique({
      where: { slug },
      include: this.getStatsInclude(),
    });
    if (!organization) return null;

    return this.mapToStats(organization);
  }

  async findByCnpj(cnpj: string): Promise<OrganizationWithStats | null> {
    const organization = await prisma.organization.findFirst({
      where: { cnpj },
      include: this.getStatsInclude(),
    });
    if (!organization) return null;

    return this.mapToStats(organization);
  }

  async fetchOrganizations(query?: string | null): Promise<Organization[]> {
    const where: Prisma.OrganizationWhereInput = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
        { cnpj: { contains: query } },
      ];
    }

    const organizations = await prisma.organization.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return organizations;
  }

  async findMembers(organizationId: string): Promise<OrganizationMember[]> {
    const rawMembers = await prisma.user.findMany({
      where: {
        organizationId,
      },
      include: {
        customRole: true,
        loginHistories: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Aplica o parse em cada item do array
    return rawMembers.map((member) => this.mapToSafeMember(member));
  }

  async findCustomRoles(
    organizationId: string,
  ): Promise<CustomRoleWithUsage[]> {
    const roles = await prisma.customRole.findMany({
      where: {
        organizationId,
      },
      include: {
        _count: {
          select: {
            users: true, // Conta quantos usuários possuem esse role
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return roles;
  }

  async deleteCustomRole(roleId: string): Promise<void> {
    await prisma.customRole.delete({
      where: { id: roleId },
    });
  }

  async createCustomRole(data: ICreateCustomRoleDTO): Promise<CustomRole> {
    const role = await prisma.customRole.create({
      data: {
        organizationId: data.organizationId,
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      },
    });
    return role;
  }

  async updateCustomRole(data: IUpdateCustomRoleDTO): Promise<CustomRole> {
    const { id, ...updateData } = data;

    const role = await prisma.customRole.update({
      where: { id },
      data: updateData,
    });
    return role;
  }

  async findCustomRoleById(id: string): Promise<CustomRole | null> {
    return prisma.customRole.findUnique({
      where: { id },
    });
  }

  private getStatsInclude() {
    return {
      _count: {
        select: {
          users: true,
          customRoles: true,
          projects: true,
        },
      },
    };
  }

  private mapToStats(
    org: Organization & {
      _count: { users: number; customRoles: number; projects: number };
    },
  ): OrganizationWithStats {
    const { _count, ...rest } = org;
    return {
      ...rest,
      totalOfUsers: _count.users,
      totalOfCustomRoles: _count.customRoles,
      totalOfProjects: _count.projects,
    };
  }

  private mapToSafeMember(raw: RawMember): OrganizationMember {
    // Desestrutura para separar o passwordHash do resto
    const { passwordHash, ...rest } = raw;

    return {
      ...rest,
      hasPassword: !!passwordHash, // Converte a existência da hash em boolean
    };
  }
}
