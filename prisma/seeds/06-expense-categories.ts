import type { PrismaClient } from "@/generated/prisma/client";
import { log } from "./utils";

const expenseCategories = [
  {
    nature: "OPERATIONAL",
    name: "Infraestrutura Cloud & Servidores",
    description:
      "Custos com Oracle Cloud, AWS, Vercel ou instâncias de bancos de dados.",
  },
  {
    nature: "OPERATIONAL",
    name: "Assinaturas de Software (SaaS)",
    description:
      "Ferramentas de produtividade: GitHub, Slack, Notion, e licenças de IDEs.",
  },
  {
    nature: "OPERATIONAL",
    name: "Marketing & Anúncios",
    description:
      "Gastos com Google Ads, LinkedIn Ads e ferramentas de e-mail marketing.",
  },
  {
    nature: "OPERATIONAL",
    name: "Serviços Contábeis e Taxas",
    description:
      "Mensalidade da contabilidade, taxas bancárias e renovação de certificados digitais.",
  },
  {
    nature: "DIRECT_PROJECT",
    name: "Subcontratação (Freelancers)",
    description:
      "Pagamentos feitos a terceiros para execução de partes específicas de um projeto.",
  },
  {
    nature: "DIRECT_PROJECT",
    name: "APIs e Serviços de Terceiros (Consumo)",
    description:
      "Custos variáveis de APIs para projetos: OpenAI, Google Maps, Gateways de SMS/WhatsApp.",
  },
  {
    nature: "INVESTMENT",
    name: "Hardware e Equipamentos",
    description:
      "Compra de laptops, servidores ARM, periféricos e mobiliário de escritório.",
  },
  {
    nature: "INVESTMENT",
    name: "Educação e Certificações",
    description:
      "Cursos, pós-graduação (CEUB), e exames de certificação (AWS, Azure, GCP).",
  },
  {
    nature: "PERSONAL",
    name: "Pró-labore e Dividendos",
    description: "Retiradas mensais dos sócios e distribuição de lucros.",
  },
  {
    nature: "PERSONAL",
    name: "Despesas de Representação",
    description: "Almoços de negócios, viagens para eventos e networking.",
  },
];

export async function seedExpenseCategories(
  prisma: PrismaClient,
  organizationId: string,
): Promise<void> {
  log("💸 Sincronizando categorias de despesas...");

  for (const category of expenseCategories) {
    const existing = await prisma.expenseCategory.findFirst({
      where: { organizationId, name: category.name },
    });

    if (!existing) {
      await prisma.expenseCategory.create({
        data: {
          organizationId,
          name: category.name,
          description: category.description,
          nature: category.nature as "OPERATIONAL",
        },
      });
      log(`   ✅ Criada: ${category.name} [${category.nature}]`);
    } else if (existing.nature !== category.nature) {
      await prisma.expenseCategory.update({
        where: { id: existing.id },
        data: { nature: category.nature as "OPERATIONAL" },
      });
      log(`   🔄 Atualizada Natureza: ${category.name}`);
    } else {
      log(`   ⏭️ Já existe: ${category.name}`);
    }
  }
}
