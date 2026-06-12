import {
  ClientEmployeeRole,
  ClientEmployeeStatus,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type ClientMembership = {
  clientId: string;
  clientSlug: string;
  tradeName: string;
  companyName: string;
  employeeRole: ClientEmployeeRole;
  status: ClientEmployeeStatus;
};

export async function loadClientMemberships(
  userId: string,
  organizationId: string,
): Promise<ClientMembership[]> {
  const rows = await prisma.clientEmployees.findMany({
    where: {
      userId,
      organizationId,
      deletedAt: null,
      status: { in: ["ACTIVE", "PENDING"] },
    },
    include: {
      client: {
        select: {
          id: true,
          slug: true,
          tradeName: true,
          companyName: true,
          deletedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows
    .filter((row) => !row.client.deletedAt)
    .map((row) => ({
      clientId: row.clientId,
      clientSlug: row.client.slug,
      tradeName: row.client.tradeName,
      companyName: row.client.companyName,
      employeeRole: row.permissionRole,
      status: row.status,
    }));
}
