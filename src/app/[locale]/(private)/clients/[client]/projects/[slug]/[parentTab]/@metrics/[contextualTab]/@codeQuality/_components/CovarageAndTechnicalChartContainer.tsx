import { getCachedSonarHistory } from "../_data/get-sonarqube-history";
import { CoverageLineChart } from "./CoverageLineChart";
import { TechnicalDebtBarChart } from "./TechnicalDebtBarChart";

interface ICovarageAndTechnicalChartContainer {
  slug: string;
}

export async function CovarageAndTechnicalChartContainer({
  slug,
}: ICovarageAndTechnicalChartContainer) {
  const history = await getCachedSonarHistory(slug);

  if (!history) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <CoverageLineChart data={history.data} />
      <TechnicalDebtBarChart data={history.data} />
    </div>
  );
}
