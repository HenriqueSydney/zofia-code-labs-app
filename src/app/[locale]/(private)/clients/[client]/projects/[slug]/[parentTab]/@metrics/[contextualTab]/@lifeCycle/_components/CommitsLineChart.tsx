import {
  AreaLineChart,
  ChartCategory,
} from "@/components/Charts/AreaLineChart";
import { date } from "@/lib/dayjs";

import { getCachedGitHubMetrics } from "../_data/get-github-metrics";

interface ICommitLineChart {
  slug: string;
}

export async function CommitLineChart({ slug }: ICommitLineChart) {
  const { activity } = await getCachedGitHubMetrics(slug);

  const { commits } = activity;
  const chartData = commits.stats.map((item) => ({
    displayDate: date(item.date).format("DD/MMM"),
    commits: item.count,
  }));

  // 2. Configuração visual das categorias (colunas do gráfico)
  const categories: ChartCategory[] = [
    {
      key: "commits",
      label: "Commits",
      color: "hsl(var(--primary))",
    },
  ];
  return (
    <AreaLineChart
      title="Atividade de Commits"
      description="Últimos 30 dias"
      data={chartData}
      indexKey="displayDate"
      categories={categories}
    />
  );
}
