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
  Member,
  MemberRole,
  Organization,
  Prisma,
  Role,
  User,
} from "@/generated/prisma/client";
import { DocumentInput } from "@/@types/DocumentInput";
import { date } from "@/lib/dayjs";

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
    const rawMembers = await prisma.member.findMany({
      where: {
        organizationId,
      },
      include: {
        customRole: true,
        user: {
          select: {
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            loginHistories: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    // Aplica o parse em cada item do array
    return rawMembers.map((member) => this.flatMemberLoginHistory(member));
  }

  async findMemberByMemberId(
    memberId: string,
    organizationId: string,
  ): Promise<OrganizationMember | null> {
    const member = await prisma.member.findUnique({
      where: {
        id: memberId,
        organizationId,
      },
      include: {
        customRole: true,
        user: {
          select: {
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            loginHistories: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!member) {
      return null;
    }

    // Aplica o parse em cada item do array
    return this.flatMemberLoginHistory(member);
  }

  async updateMemberCustomRole(
    memberId: string,
    customRoleId: string,
  ): Promise<void> {
    await prisma.member.update({
      where: {
        id: memberId,
      },
      data: {
        customRoleId,
      },
    });
  }

  async updateMemberRole(memberId: string, role: MemberRole): Promise<void> {
    await prisma.member.update({
      where: {
        id: memberId,
      },
      data: {
        role,
      },
    });
  }

  async updateMemberSpecificPermissions(
    memberId: string,
    permissions: string[],
  ): Promise<OrganizationMember> {
    const member = await prisma.member.update({
      where: { id: memberId },
      data: {
        specificPermissions: permissions,
      },
      include: {
        customRole: true,
        user: {
          select: {
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            loginHistories: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });
    return this.flatMemberLoginHistory(member);
  }

  async removeMemberFromOrganization(
    memberId: string,
    organizationId: string,
  ): Promise<void> {
    await prisma.member.update({
      where: {
        id: memberId,
        organizationId: organizationId,
      },
      data: {
        removedAt: date().toDate(),
      },
    });
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
            members: true, // Conta quantos usuários possuem esse role
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
          members: true,
          customRoles: true,
          projects: true,
        },
      },
    };
  }

  private mapToStats(
    org: Organization & {
      _count: { members: number; customRoles: number; projects: number };
    },
  ): OrganizationWithStats {
    const { _count, ...rest } = org;
    return {
      ...rest,
      totalOfMembers: _count.members,
      totalOfCustomRoles: _count.customRoles,
      totalOfProjects: _count.projects,
    };
  }

  private flatMemberLoginHistory(
    memberWithLoginHistory: Member & {
      customRole: CustomRole | null;
      user: {
        name: string | null;
        email: string;
        emailVerified: Date | null;
        image: string | null;
        loginHistories: LoginHistory[];
      };
    },
  ): OrganizationMember {
    const { user: rawUser, ...member } = memberWithLoginHistory;
    const { loginHistories, ...user } = rawUser;

    return {
      ...member,
      ...user,
      loginHistories: loginHistories, // Converte a existência da hash em boolean
    };
  }
}
