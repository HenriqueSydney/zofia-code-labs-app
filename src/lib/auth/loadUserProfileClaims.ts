import { MemberRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type ProfileClaims = {
  permissions: string[];
  memberRole: MemberRole | null;
  roleName: string | null;
  customRoleId: string | null;
};

export async function loadUserProfileClaims(
  userId: string,
  organizationId: string,
): Promise<ProfileClaims> {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      organizationId,
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
      permissions: [],
      memberRole: null,
      roleName: null,
      customRoleId: null,
    };
  }

  const rolePermissions = member.customRole?.permissions ?? [];
  const specificPermissions = member.specificPermissions ?? [];
  const permissions = Array.from(
    new Set([...rolePermissions, ...specificPermissions]),
  );

  return {
    permissions,
    memberRole: member.role,
    roleName: member.customRole?.name ?? member.role,
    customRoleId: member.customRoleId,
  };
}
