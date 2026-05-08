import { getFinancialOverviewAction } from "@/actions/stats/getFinancialOverviewAction";
import { StatsCardsSkeleton } from "@/components/skeletons/StatsCardsSkeleton";
import { StatsCard } from "@/components/StatsCard";
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";

const iconMap = {
  DollarSign: DollarSign,
  Wallet: Wallet,
  TrendingDown: TrendingDown,
  TrendingUp: TrendingUp,
};

export async function FinancialStatsCards() {
  const { data } = await getFinancialOverviewAction();

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.cards.map((card, index) => {
        const Icon =
          iconMap[card.iconKey as keyof typeof iconMap] || DollarSign;
        // Tratamento simples para converter string de trend em number se o StatsCard pedir number
        // Ou adaptar o StatsCard para aceitar string. Aqui assumo que passamos o valor limpo.
        const trendValue = parseFloat(card.trend.replace(/[^0-9.-]/g, ""));

        return (
          <StatsCard
            key={index}
            label={card.title}
            mainInformation={card.value}
            Icon={Icon}
            trend={isNaN(trendValue) ? undefined : trendValue}
            description={card.description}
            reverseColor={card.title.includes("Despesas")} // Despesa subindo é vermelho
            iconColor={
              card.title.includes("Despesas")
                ? "bg-destructive/10"
                : "bg-primary/10"
            }
          />
        );
      })}
    </div>
  );
}

export function FinancialStatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <StatsCardsSkeleton key={i} />
      ))}
    </div>
  );
}
