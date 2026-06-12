import { MemberRole } from "@/generated/prisma/enums";
import { ResourceNotFoundError } from "@/errors";
import { prisma } from "@/lib/prisma";
import { signUserAvatar } from "./signUserAvatar";

export async function getMainProfileData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      image: true,
      role: true,
      email: true,
      createdAt: true,
      emailVerified: true,
    },
  });

  if (!user) {
    throw new ResourceNotFoundError("Usuário não localizado");
  }

  const image = await signUserAvatar(user.image);

  return { ...user, image };
}

export async function getUserOrganization(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          cnpj: true,
          industry: true,
          createdAt: true,
        },
      },
    },
  });

  return user?.organization ?? null;
}

export type UserPermissionsProfile = {
  organizationId: string | null;
  memberRole: MemberRole | null;
  roleName: string | null;
  customRoleId: string | null;
  rolePermissions: string[];
  specificPermissions: string[];
  allPermissions: string[];
};

export async function getUserPermissionsProfile(
  userId: string,
): Promise<UserPermissionsProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });

  if (!user?.organizationId) {
    return {
      organizationId: null,
      memberRole: null,
      roleName: null,
      customRoleId: null,
      rolePermissions: [],
      specificPermissions: [],
      allPermissions: [],
    };
  }

  const member = await prisma.member.findFirst({
    where: {
      userId,
      organizationId: user.organizationId,
      removedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      role: true,
      specificPermissions: true,
      customRoleId: true,
      customRole: {
        select: {
          id: true,
          name: true,
          permissions: true,
        },
      },
    },
  });

  if (!member) {
    return {
      organizationId: user.organizationId,
      memberRole: null,
      roleName: null,
      customRoleId: null,
      rolePermissions: [],
      specificPermissions: [],
      allPermissions: [],
    };
  }

  const rolePermissions = member.customRole?.permissions ?? [];
  const specificPermissions = member.specificPermissions ?? [];
  const allPermissions = Array.from(
    new Set([...rolePermissions, ...specificPermissions]),
  );

  return {
    organizationId: user.organizationId,
    memberRole: member.role,
    roleName: member.customRole?.name ?? member.role,
    customRoleId: member.customRoleId,
    rolePermissions,
    specificPermissions,
    allPermissions,
  };
}

export async function getUserSecurityData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    throw new ResourceNotFoundError("Usuário não localizado");
  }

  return { hasPassword: !!user.passwordHash };
}

export async function getUserConnectedAccounts(userId: string) {
  return prisma.account.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserLoginHistory(userId: string) {
  return prisma.loginHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

export async function getUserFooterData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, updatedAt: true },
  });

  if (!user) {
    throw new ResourceNotFoundError("Usuário não localizado");
  }

  return user;
}
