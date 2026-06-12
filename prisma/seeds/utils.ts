import type { PrismaClient } from "@/generated/prisma/client";

export function log(message: string) {
  console.log(message);
}

export async function upsertCustomRole(
  prisma: PrismaClient,
  data: {
    organizationId: string;
    name: string;
    description: string;
    permissions: string[];
  },
): Promise<string> {
  const existing = await prisma.customRole.findFirst({
    where: {
      organizationId: data.organizationId,
      name: data.name,
    },
  });

  if (existing) {
    await prisma.customRole.update({
      where: { id: existing.id },
      data: {
        description: data.description,
        permissions: data.permissions,
      },
    });
    log(`   🔄 Perfil atualizado: ${data.name}`);
    return existing.id;
  }

  const created = await prisma.customRole.create({ data });
  log(`   ✅ Perfil criado: ${data.name}`);
  return created.id;
}
