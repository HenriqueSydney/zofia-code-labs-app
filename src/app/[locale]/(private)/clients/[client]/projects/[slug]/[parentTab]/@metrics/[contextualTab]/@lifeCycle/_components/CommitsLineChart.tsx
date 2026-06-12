import {
  AreaLineChart,
  ChartCategory,
} from "@/components/Charts/AreaLineChart";
import { date } from "@/lib/dayjs";
import { getTranslations } from "next-intl/server";
import { getCachedGitHubMetrics } from "../_data/get-github-metrics";

interface ICommitLineChart {
  slug: string;
}

export async function CommitLineChart({ slug }: ICommitLineChart) {
  const t = await getTranslations("projects.metrics.lifecycle.charts.commitActivity");
  const { activity } = await getCachedGitHubMetrics(slug);

  const { commits } = activity;
  const chartData = commits.stats.map((item) => ({
    displayDate: date(item.date).format("DD/MMM"),
    commits: item.count,
  }));

  const categories: ChartCategory[] = [
    {
      key: "commits",
      label: t("commits"),
      color: "hsl(var(--primary))",
    },
  ];

  return (
    <AreaLineChart
      title={t("title")}
      description={t("description")}
      data={chartData}
      indexKey="displayDate"
      categories={categories}
    />
  );
}
