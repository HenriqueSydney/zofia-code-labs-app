import { StatsCard } from "@/components/StatsCard";
import { Eye, Files, MousePointerClick, Timer, Users } from "lucide-react";
import { getCachedUmamiMetrics } from "../_data/get-umami-metrics";
import { formatDuration } from "@/utils/formatDuration";

export async function MetricsGrid({ slug }: { slug: string }) {
  const metrics = await getCachedUmamiMetrics(slug);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatsCard
        label="Page Views"
        mainInformation={metrics.pageviews}
        trend={metrics.trends.pageviews}
        Icon={Eye}
        iconColor="bg-blue-500/10"
        reverseColor={false} // Mais views = bom
      />

      <StatsCard
        label="Visitantes Únicos"
        mainInformation={metrics.visitors}
        trend={metrics.trends.visitors}
        Icon={Users}
        iconColor="bg-primary/10"
        reverseColor={false} // Mais visitantes = bom
      />

      <StatsCard
        label="Taxa de Rejeição"
        mainInformation={`${metrics.bounceRate}%`}
        trend={metrics.trends.bounceRate}
        Icon={MousePointerClick}
        iconColor="bg-destructive/10"
        reverseColor={true} // Taxa de rejeição alta = ruim
      />

      <StatsCard
        label="Duração Média"
        mainInformation={formatDuration(metrics.avgDuration)} // Ex: "2m 15s"
        trend={metrics.trends.avgDuration}
        Icon={Timer}
        iconColor="bg-green-500/10"
        reverseColor={false} // Mais tempo no site = bom
      />

      <StatsCard
        label="Páginas/Sessão"
        mainInformation={metrics.pagesPerSession}
        trend={metrics.trends.pagesPerSession}
        Icon={Files}
        iconColor="bg-orange-500/10"
        reverseColor={false} // Mais páginas por sessão = bom
      />
    </div>
  );
}
