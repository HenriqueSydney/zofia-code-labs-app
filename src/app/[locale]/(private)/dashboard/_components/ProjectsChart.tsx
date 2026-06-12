import { getProjectsVolumeChartAction } from "@/actions/stats/getProjectsVolumeChartAction";
import { BarChart } from "@/components/Charts/BarChart";
import { getTranslations } from "next-intl/server";

export async function ProjectsChart() {
  const t = await getTranslations("admin.chart.projectsVolume");
  const { data: chartData } = await getProjectsVolumeChartAction();

  if (!chartData) return null;

  return (
    <div className="col-span-4">
      <BarChart
        title={t("title")}
        description={t("description")}
        data={chartData}
        indexKey="month"
        categories={[
          { key: "projects", label: t("series"), color: "#2563eb" },
        ]}
        height={350}
      />
    </div>
  );
}
