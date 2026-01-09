import { StatsCard } from "@/components/StatsCard";
import { Bug, CheckCircle, Clock, Code, Shield } from "lucide-react";
import { getCachedSonarMetrics } from "../_data/get-sonarqube-metrics";

export async function MetricsGrid({ slug }: { slug: string }) {
  const metrics = await getCachedSonarMetrics(slug);

  // Helper para formatar dívida técnica: minutos para formato legível (ex: 65h ou 1d 4h)
  const formatDebt = (minutes: number) => {
    const hours = Math.round(minutes / 60);
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatsCard
        label="Bugs"
        mainInformation={metrics.bugs}
        trend={metrics.trends.bugs}
        Icon={Bug}
        iconColor="bg-destructive/10"
        reverseColor={true} // Mais bugs = ruim
      />
      <StatsCard
        label="Vulnerabilidades"
        mainInformation={metrics.vulnerabilities}
        trend={metrics.trends.vulnerabilities}
        Icon={Shield}
        iconColor="bg-orange-500/10"
        reverseColor={true} // Mais vulnerabilidades = ruim
      />
      <StatsCard
        label="Code Smells"
        mainInformation={metrics.codeSmells}
        trend={metrics.trends.codeSmells}
        Icon={Code}
        iconColor="bg-orange-500/10" // Usando orange para manter o padrão visual de alerta
        reverseColor={true}
      />
      <StatsCard
        label="Cobertura"
        mainInformation={`${metrics.coverage}%`}
        trend={metrics.trends.coverage}
        Icon={CheckCircle}
        iconColor="bg-primary/10"
        reverseColor={false} // Mais cobertura = bom
      />
      <StatsCard
        label="Débito Técnico"
        mainInformation={formatDebt(metrics.technicalDebt)}
        trend={metrics.trends.technicalDebt}
        Icon={Clock}
        iconColor="bg-primary/10"
        reverseColor={true} // Mais débito = ruim
      />
    </div>
  );
}
