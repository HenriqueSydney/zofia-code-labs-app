import { BusinessRuleError } from "@/errors";
import { MemberRole, MemberStatus, Prisma } from "@/generated/prisma/client";

export async function ensureTenantObserverMember(
  tx: Prisma.TransactionClient,
  userId: string,
  organizationId: string,
): Promise<void> {
  const existing = await tx.member.findUnique({
    where: {
      userId_organizationId: { userId, organizationId },
    },
  });

  if (!existing) {
    await tx.member.create({
      data: {
        userId,
        organizationId,
        role: MemberRole.TENANT_OBSERVER,
        status: MemberStatus.ACTIVE,
      },
    });
    return;
  }

  if (
    existing.role === MemberRole.TENANT_ADMIN ||
    existing.role === MemberRole.TENANT_MEMBER
  ) {
    return;
  }

  if (existing.removedAt) {
    await tx.member.update({
      where: { id: existing.id },
      data: {
        removedAt: null,
        role: MemberRole.TENANT_OBSERVER,
        status: MemberStatus.ACTIVE,
      },
    });
  }
}
