import { getOrganizationOverviewStatsAction } from "@/actions/stats/getOrganizationOverviewStatsAction";
import { StatsCardsSkeleton } from "@/components/skeletons/StatsCardsSkeleton";
import { StatsCard } from "@/components/StatsCard"; // Seu componente existente
import { CheckCircle2, FolderKanban, TrendingUp, Users } from "lucide-react";

// Mapa de ícones para converter string do backend em componente React
const iconMap = {
  FolderKanban: FolderKanban,
  TrendingUp: TrendingUp,
  CheckCircle2: CheckCircle2,
  Users: Users,
};

export async function StatsCards() {
  const { data: stats } = await getOrganizationOverviewStatsAction();

  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const IconComponent =
          iconMap[stat.iconKey as keyof typeof iconMap] || FolderKanban;

        // Removemos o "%" para passar apenas o número para o componente StatsCard,
        // caso ele espere number no trend. Se esperar string, ajuste conforme necessário.
        const trendValue = parseFloat(
          stat.trend.replace("%", "").replace("+", ""),
        );

        return (
          <StatsCard
            key={index}
            label={stat.title}
            mainInformation={stat.value}
            Icon={IconComponent}
            trend={trendValue}
            // reverseColor=false significa que subir é BOM (verde)
            reverseColor={false}
            description="em relação ao mês anterior"
            iconColor="bg-primary/10"
          />
        );
      })}
    </div>
  );
}

// Skeleton para Suspense
export function StatsCardsSkeletonContainer() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <StatsCardsSkeleton key={i} />
      ))}
    </div>
  );
}
