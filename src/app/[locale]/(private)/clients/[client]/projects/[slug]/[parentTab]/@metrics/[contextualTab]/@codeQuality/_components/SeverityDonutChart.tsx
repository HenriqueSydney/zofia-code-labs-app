import { DonutChart } from "@/components/Charts/DonutChart";
import { getTranslations } from "next-intl/server";

const SEVERITY_COLORS: Record<string, string> = {
  Blocker: "hsl(var(--destructive))",
  Critical: "#ea580c",
  Major: "#f59e0b",
  Minor: "#eab308",
  Info: "#3b82f6",
};

export async function SeverityDonutChart({ data }: { data: any[] }) {
  const t = await getTranslations("projects.metrics.codeQuality.charts.severityDonut");

  return (
    <DonutChart
      title={t("title")}
      description={t("description")}
      data={data}
      colors={SEVERITY_COLORS}
    />
  );
}
