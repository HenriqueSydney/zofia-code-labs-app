import { randomUUID } from "node:crypto";
import { DocumentInput } from "../../@types/DocumentInput";
import {
  CustomRole,
  IndustryType,
  LoginHistory,
  Member,
  MemberRole,
  MemberStatus,
  Organization,
} from "../../generated/prisma/client";
import { date } from "../../lib/dayjs";
import {
  CustomRoleWithUsage,
  ICreateCustomRoleDTO,
  ICreateOrganizationDTO,
  ICreateOrganizationMemberDTO,
  IOrganizationsRepository,
  IReactivateOrganizationMemberDTO,
  IUpdateCustomRoleDTO,
  IUpdateOrganizationDTO,
  OrganizationMember,
  OrganizationWithStats,
} from "../IOrganizationRepository";

type OrganizationUser = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
};

export class InMemoryOrganizationsRepository implements IOrganizationsRepository {
  public organizations: Organization[] = [];
  public members: Member[] = [];
  public customRoles: CustomRole[] = [];
  public users: OrganizationUser[] = [];
  public loginHistories: LoginHistory[] = [];
  public projectCountByOrganizationId: Record<string, number> = {};

  async create(
    data: ICreateOrganizationDTO,
    _document?: DocumentInput,
  ): Promise<Organization> {
    const now = date().toDate();
    const organization: Organization = {
      id: randomUUID(),
      name: data.name,
      slug: data.slug,
      cnpj: data.cnpj ?? null,
      logoUrl: data.logoUrl ?? null,
      industry: data.industry ?? ("SOFTWARE_HOUSE" as IndustryType),
      settings: null,
      createdAt: now,
      updatedAt: now,
    };
    this.organizations.push(organization);
    return organization;
  }

  async update(
    data: IUpdateOrganizationDTO,
    _document?: DocumentInput,
  ): Promise<Organization> {
    const index = this.organizations.findIndex((org) => org.id === data.id);
    if (index === -1) {
      throw new Error("Organization not found");
    }

    const current = this.organizations[index];
    const updated: Organization = {
      ...current,
      name: data.name ?? current.name,
      slug: data.slug ?? current.slug,
      cnpj: data.cnpj ?? current.cnpj,
      industry: data.industry ?? current.industry,
      logoUrl: data.file ?? current.logoUrl,
      updatedAt: date().toDate(),
    };
    this.organizations[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.organizations = this.organizations.filter((org) => org.id !== id);
  }

  async findById(id: string): Promise<OrganizationWithStats | null> {
    const organization = this.organizations.find((org) => org.id === id);
    if (!organization) return null;
    return this.mapToStats(organization);
  }

  async findBySlug(slug: string): Promise<OrganizationWithStats | null> {
    const organization = this.organizations.find((org) => org.slug === slug);
    if (!organization) return null;
    return this.mapToStats(organization);
  }

  async findByCnpj(cnpj: string): Promise<OrganizationWithStats | null> {
    const organization = this.organizations.find((org) => org.cnpj === cnpj);
    if (!organization) return null;
    return this.mapToStats(organization);
  }

  async fetchOrganizations(query?: string | null): Promise<Organization[]> {
    let filtered = [...this.organizations];

    if (query) {
      const normalizedQuery = query.toLowerCase();
      filtered = filtered.filter(
        (org) =>
          org.name.toLowerCase().includes(normalizedQuery) ||
          org.slug.toLowerCase().includes(normalizedQuery) ||
          (org.cnpj?.includes(query) ?? false),
      );
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findMembers(organizationId: string): Promise<OrganizationMember[]> {
    return this.members
      .filter(
        (member) =>
          member.organizationId === organizationId && member.removedAt === null,
      )
      .map((member) => this.mapMember(member))
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }

  async findMemberByMemberId(
    memberId: string,
    organizationId: string,
  ): Promise<OrganizationMember | null> {
    const member = this.members.find(
      (item) => item.id === memberId && item.organizationId === organizationId,
    );
    if (!member) return null;
    return this.mapMember(member);
  }

  async findMemberByUserIdAndOrganizationId(
    userId: string,
    organizationId: string,
    _tx?: unknown,
  ): Promise<Member | null> {
    return (
      this.members.find(
        (item) =>
          item.userId === userId && item.organizationId === organizationId,
      ) ?? null
    );
  }

  async createMember(
    data: ICreateOrganizationMemberDTO,
    _tx?: unknown,
  ): Promise<Member> {
    const member: Member = {
      id: randomUUID(),
      userId: data.userId,
      organizationId: data.organizationId,
      role: data.role,
      customRoleId: data.customRoleId ?? null,
      specificPermissions: [],
      status: data.status ?? MemberStatus.PENDING,
      createdAt: date().toDate(),
      updatedAt: date().toDate(),
      removedAt: null,
    };

    this.members.push(member);
    return member;
  }

  async reactivateMember(
    memberId: string,
    data: IReactivateOrganizationMemberDTO,
    _tx?: unknown,
  ): Promise<Member> {
    const member = this.members.find((item) => item.id === memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    member.removedAt = null;
    member.role = data.role;
    member.customRoleId = data.customRoleId ?? null;
    member.status = data.status ?? MemberStatus.PENDING;
    member.updatedAt = date().toDate();
    return member;
  }

  async findPendingMembersByUserId(
    userId: string,
    _tx?: unknown,
  ): Promise<Member[]> {
    return this.members.filter(
      (item) =>
        item.userId === userId &&
        item.status === MemberStatus.PENDING &&
        item.removedAt === null,
    );
  }

  async activateMember(memberId: string, _tx?: unknown): Promise<Member> {
    const member = this.members.find((item) => item.id === memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    member.status = MemberStatus.ACTIVE;
    member.updatedAt = date().toDate();
    return member;
  }

  async findOrganizationAdminContacts(organizationId: string) {
    return this.members
      .filter(
        (item) =>
          item.organizationId === organizationId &&
          item.role === MemberRole.TENANT_ADMIN &&
          item.status === MemberStatus.ACTIVE &&
          item.removedAt === null,
      )
      .map((item) => {
        const user = this.users.find((u) => u.id === item.userId);
        return {
          name: user?.name ?? null,
          email: user?.email ?? "",
        };
      })
      .filter((admin) => admin.email);
  }

  async updateMemberCustomRole(
    memberId: string,
    customRoleId: string,
  ): Promise<void> {
    const member = this.members.find((item) => item.id === memberId);
    if (!member) {
      throw new Error("Member not found");
    }
    member.customRoleId = customRoleId;
    member.updatedAt = date().toDate();
  }

  async updateMemberRole(memberId: string, role: MemberRole): Promise<void> {
    const member = this.members.find((item) => item.id === memberId);
    if (!member) {
      throw new Error("Member not found");
    }
    member.role = role;
    member.updatedAt = date().toDate();
  }

  async removeMemberFromOrganization(
    memberId: string,
    organizationId: string,
  ): Promise<void> {
    const member = this.members.find(
      (item) => item.id === memberId && item.organizationId === organizationId,
    );
    if (!member) {
      throw new Error("Member not found");
    }
    member.removedAt = date().toDate();
    member.status = MemberStatus.INACTIVE;
    member.updatedAt = date().toDate();
  }

  async updateMemberSpecificPermissions(
    memberId: string,
    permissions: string[],
  ): Promise<OrganizationMember> {
    const member = this.members.find((item) => item.id === memberId);
    if (!member) {
      throw new Error("Member not found");
    }
    member.specificPermissions = permissions;
    member.updatedAt = date().toDate();
    return this.mapMember(member);
  }

  async findCustomRoles(
    organizationId: string,
  ): Promise<CustomRoleWithUsage[]> {
    return this.customRoles
      .filter((role) => role.organizationId === organizationId)
      .map((role) => ({
        ...role,
        _count: {
          members: this.members.filter(
            (member) => member.customRoleId === role.id && member.removedAt === null,
          ).length,
        },
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async deleteCustomRole(roleId: string): Promise<void> {
    this.customRoles = this.customRoles.filter((role) => role.id !== roleId);
  }

  async createCustomRole(data: ICreateCustomRoleDTO): Promise<CustomRole> {
    const role: CustomRole = {
      id: randomUUID(),
      organizationId: data.organizationId,
      name: data.name,
      description: data.description ?? null,
      permissions: data.permissions,
    };
    this.customRoles.push(role);
    return role;
  }

  async updateCustomRole(data: IUpdateCustomRoleDTO): Promise<CustomRole> {
    const index = this.customRoles.findIndex((role) => role.id === data.id);
    if (index === -1) {
      throw new Error("Custom role not found");
    }

    const current = this.customRoles[index];
    const updated: CustomRole = {
      ...current,
      name: data.name ?? current.name,
      description: data.description ?? current.description,
      permissions: data.permissions ?? current.permissions,
    };
    this.customRoles[index] = updated;
    return updated;
  }

  async findCustomRoleById(id: string): Promise<CustomRole | null> {
    return this.customRoles.find((role) => role.id === id) ?? null;
  }

  private mapToStats(organization: Organization): OrganizationWithStats {
    return {
      ...organization,
      totalOfMembers: this.members.filter(
        (member) =>
          member.organizationId === organization.id && member.removedAt === null,
      ).length,
      totalOfCustomRoles: this.customRoles.filter(
        (role) => role.organizationId === organization.id,
      ).length,
      totalOfProjects: this.projectCountByOrganizationId[organization.id] ?? 0,
    };
  }

  private mapMember(member: Member): OrganizationMember {
    const user = this.users.find((item) => item.id === member.userId);
    const customRole = member.customRoleId
      ? (this.customRoles.find((role) => role.id === member.customRoleId) ?? null)
      : null;

    const histories = this.loginHistories
      .filter((history) => history.userId === member.userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 1);

    return {
      ...member,
      customRole,
      name: user?.name ?? null,
      email: user?.email ?? "",
      emailVerified: user?.emailVerified ?? null,
      image: user?.image ?? null,
      loginHistories: histories,
    };
  }
}
