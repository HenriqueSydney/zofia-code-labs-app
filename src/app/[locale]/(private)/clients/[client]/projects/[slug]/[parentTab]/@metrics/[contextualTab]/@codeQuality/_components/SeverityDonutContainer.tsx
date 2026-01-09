import { getCachedSonarMetrics } from "../_data/get-sonarqube-metrics";
import { SeverityDonutChart } from "./SeverityDonutChart";

interface ISeverityDonutContainer {
  slug: string;
}

export async function SeverityDonutContainer({
  slug,
}: ISeverityDonutContainer) {
  const metrics = await getCachedSonarMetrics(slug);

  return (
    <div className="lg:col-span-3">
      <SeverityDonutChart data={metrics.severity} />
    </div>
  );
}
