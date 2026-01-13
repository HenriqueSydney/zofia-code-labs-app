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
// A action que criamos anteriormente

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string; contextualTab: string }>;
}

export default async function ProjectLayout({ children, params }: LayoutProps) {
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
          label="Em Negociação (Propostas)"
          // O UseCase já retorna formatado: cards.proposals.value
          mainInformation={cards.proposals.value}
          Icon={FileText}
          iconColor="bg-blue-500/10 text-blue-500"
          description={`${cards.proposals.count} propostas ativas no funil`}
        />

        {/* CARD 2: Backlog de Receita */}
        <StatsCard
          label="Total Contratado"
          mainInformation={cards.contracts.value}
          Icon={Handshake}
          iconColor="bg-emerald-500/10 text-emerald-500"
          description={`${cards.contracts.count} contratos ativos`}
        />

        {/* CARD 3: Caixa Realizado */}
        <StatsCard
          label="Receita Realizada"
          mainInformation={cards.financials.received}
          Icon={Wallet}
          iconColor="bg-amber-500/10 text-amber-500"
          description="Faturas pagas (Cash in)"
        />

        {/* CARD 4: Resultado Líquido (ROI) */}
        {/* O UseCase retorna 'result' contendo netValue e profitMargin */}
        <StatsCard
          label="Resultado Líquido"
          mainInformation={cards.result.netValue}
          // Lógica visual baseada na margem de lucro (number)
          Icon={cards.result.profitMargin >= 0 ? TrendingUp : AlertCircle}
          iconColor={
            cards.result.profitMargin >= 0
              ? "bg-green-500/10 text-green-500"
              : "bg-red-500/10 text-red-500"
          }
          description={`Margem de lucro atual: ${cards.result.profitMargin.toFixed(
            1
          )}%`}
        />
      </div>

      {children}
    </TabsContent>
  );
}
