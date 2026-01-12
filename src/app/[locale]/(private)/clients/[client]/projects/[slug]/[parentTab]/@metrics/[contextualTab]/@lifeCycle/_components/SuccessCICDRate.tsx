import { DonutChart } from "@/components/Charts/DonutChart";
import { getCachedGitHubMetrics } from "../_data/get-github-metrics";

interface ISuccessCICDRateProps {
  slug: string;
}

// Cores mapeadas para os status de CI/CD
const CICD_STATUS_COLORS: Record<string, string> = {
  Sucesso: "hsl(var(--primary))", // Azul/Primary para sucesso
  Falha: "hsl(var(--destructive))", // Vermelho para falhas
};

export async function SuccessCICDRate({ slug }: ISuccessCICDRateProps) {
  // 1. Coleta os dados do cache
  const metrics = await getCachedGitHubMetrics(slug);
  const runs = metrics.pipeline.latestRuns;

  // 2. Processa os dados para o gráfico de Rosca
  const successCount = runs.filter(
    (run: any) => run.status === "success" || run.status === "completed"
  ).length;

  const failureCount = runs.length - successCount;

  // 3. Formata o array de dados para o Recharts
  const data = [
    { name: "Sucesso", value: successCount },
    { name: "Falha", value: failureCount },
  ].filter((item) => item.value > 0); // Oculta fatias zeradas para melhor visualização

  return (
    <DonutChart
      title="Taxa de Sucesso CI/CD"
      description="Distribuição das últimas execuções"
      data={data}
      colors={CICD_STATUS_COLORS}
    />
  );
}
