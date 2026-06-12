import { DonutChart } from "@/components/Charts/DonutChart";
import { getTranslations } from "next-intl/server";
import { getCachedGitHubMetrics } from "../_data/get-github-metrics";

interface ISuccessCICDRateProps {
  slug: string;
}

export async function SuccessCICDRate({ slug }: ISuccessCICDRateProps) {
  const t = await getTranslations("projects.metrics.lifecycle.charts.cicdSuccess");
  const metrics = await getCachedGitHubMetrics(slug);
  const runs = metrics.pipeline.latestRuns;

  const successCount = runs.filter(
    (run: any) => run.status === "success" || run.status === "completed",
  ).length;

  const failureCount = runs.length - successCount;

  const successLabel = t("success");
  const failureLabel = t("failure");

  const CICD_STATUS_COLORS: Record<string, string> = {
    [successLabel]: "hsl(var(--primary))",
    [failureLabel]: "hsl(var(--destructive))",
  };

  const data = [
    { name: successLabel, value: successCount },
    { name: failureLabel, value: failureCount },
  ].filter((item) => item.value > 0);

  return (
    <DonutChart
      title={t("title")}
      description={t("description")}
      data={data}
      colors={CICD_STATUS_COLORS}
    />
  );
}
