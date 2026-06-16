import type { PrismaClient } from "@/generated/prisma/client";
import { log } from "./utils";

export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  log("🗑️  Zerando todas as bases de dados...");

  const tables = await prisma.$queryRaw<
    { schemaname: string; tablename: string }[]
  >`
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname IN (
      'identity',
      'catalog',
      'crm',
      'projects',
      'financial',
      'integrations',
      'audit'
    )
    ORDER BY schemaname, tablename
  `;

  if (tables.length === 0) {
    log("   ⚠️  Nenhuma tabela encontrada para truncar.");
    return;
  }

  const tableList = tables
    .map(({ schemaname, tablename }) => `"${schemaname}"."${tablename}"`)
    .join(", ");

  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`,
  );

  log(`   ✅ ${tables.length} tabelas truncadas com sucesso.`);
}
