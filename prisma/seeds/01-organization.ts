import type { PrismaClient } from "@/generated/prisma/client";
import { log } from "./utils";

const ZOFIA_CNPJ = "53.203.636/0001-84";

export async function seedOrganization(prisma: PrismaClient): Promise<string> {
  log("🏢 Sincronizando organização...");

  const organization = await prisma.organization.upsert({
    where: { slug: "zofia-code-labs" },
    update: {
      name: "Zofia Code Labs",
      cnpj: ZOFIA_CNPJ,
    },
    create: {
      name: "Zofia Code Labs",
      slug: "zofia-code-labs",
      cnpj: ZOFIA_CNPJ,
    },
  });

  log(`   ✅ Organização: ${organization.name}`);
  return organization.id;
}
