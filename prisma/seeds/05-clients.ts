import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { generateSlug } from "@/utils/generateSlug";
import { log } from "./utils";

type ClientSeedData = Omit<Prisma.ClientUncheckedCreateInput, "organizationId">;

const clients: ClientSeedData[] = [
  {
    slug: generateSlug({ title: "Gelateria Filo Di Latte" }),
    companyName: "Shake Show Doces Alimentos LTDA",
    tradeName: "Gelateria Filo Di Latte",
    cnpj: "39.311.323/0003-01",
    email: "contato@filodilatte.com.br",
    phone: "(61) 99805-0981",
    address: "R. Alecrim, 15 - Loja 02 Águas Claras, Brasília - DF",
  },
  {
    slug: generateSlug({ title: "Acolhe Kids" }),
    companyName: "Clínica de Psicologia Infantil LTDA",
    tradeName: "Acolhe Kids",
    cnpj: "63.051.717/0001-82",
    email: "clinicaacolhekids@gmail.com",
    phone: "(61) 99174-8160",
    address:
      "St. C Norte Edifício Prime Excelência Médica, Torre A, Sala 409 Taguatinga Norte, Brasília - DF",
  },
  {
    slug: generateSlug({ title: "Dr. Berthran Severo" }),
    companyName: "Dr. Berthran Severo",
    tradeName: "Dr. Berthran",
    cnpj: "14160-DF",
    email: "atendimento@drberthran.com",
    phone: "(61) 99999-9999",
    address: "",
  },
];

export async function seedClients(
  prisma: PrismaClient,
  organizationId: string,
): Promise<void> {
  log("🏢 Sincronizando clientes...");

  return;

  for (const client of clients) {
    const existing = await prisma.client.findFirst({
      where: { organizationId, companyName: client.companyName },
    });

    if (!existing) {
      await prisma.client.create({
        data: { ...client, organizationId },
      });
      log(`   ✅ Cliente criado: ${client.companyName}`);
    } else {
      log(`   ⏭️ Cliente já existe: ${client.companyName}`);
    }
  }
}
