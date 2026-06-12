import { getParams } from "@/utils/getParams";
import {
  FileText,
  Handshake,
  Wallet,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { TabsContent } from "@/components/ui/tabs";
import { getCommercialStatsAction } from "@/actions/stats/getCommercialStatsAction";
import { getTranslations } from "next-intl/server";
// A action que criamos anteriormente

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
    client: string;
    slug: string;
    parentTab: string;
  }>;
}

export default async function ProjectLayout({ children, params }: LayoutProps) {
  const t = await getTranslations("projects.commercial.stats");
  const { slug } = await getParams(params, ["slug"]);

  // 1. Chamada da Action Real
  const metrics = await getCommercialStatsAction(slug);

  if (!metrics.data) {
    return children;
  }

  const { cards } = metrics.data;

  return (
    <TabsContent value="commercial" className="space-y-6 mt-6">
      {/* Summary Section - O HUD Comercial */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Funil de Vendas */}
        <StatsCard
          label={t("negotiation")}
          // O UseCase já retorna formatado: cards.proposals.value
          mainInformation={cards.proposals.value}
          Icon={FileText}
          iconColor="bg-blue-500/10 text-blue-500"
          description={t("proposalsActive", { count: cards.proposals.count })}
        />

        <StatsCard
          label={t("totalContracted")}
          mainInformation={cards.contracts.value}
          Icon={Handshake}
          iconColor="bg-emerald-500/10 text-emerald-500"
          description={t("contractsActive", { count: cards.contracts.count })}
        />

        <StatsCard
          label={t("realizedRevenue")}
          mainInformation={cards.financials.received}
          Icon={Wallet}
          iconColor="bg-amber-500/10 text-amber-500"
          description={t("paidInvoices")}
        />

        {/* CARD 4: Resultado Líquido (ROI) */}
        {/* O UseCase retorna 'result' contendo netValue e profitMargin */}
        <StatsCard
          label={t("netResult")}
          mainInformation={cards.result.netValue}
          // Lógica visual baseada na margem de lucro (number)
          Icon={cards.result.profitMargin >= 0 ? TrendingUp : AlertCircle}
          iconColor={
            cards.result.profitMargin >= 0
              ? "bg-green-500/10 text-green-500"
              : "bg-red-500/10 text-red-500"
          }
          description={t("profitMargin", {
            margin: cards.result.profitMargin.toFixed(1),
          })}
        />
      </div>

      {children}
    </TabsContent>
  );
}
