import { date } from "@/lib/dayjs";
import { getCachedUmamiMetrics } from "../_data/get-umami-metrics";
import { PageViewsLineChart } from "./PageViewsLineChart";
import { VisitorsBarChart } from "./VisitorsBarChart";

interface IChartsContainer {
  slug: string;
}

export async function ChartsContainer({ slug }: IChartsContainer) {
  const metrics = await getCachedUmamiMetrics(slug);

  const { history, hourlyHistory } = metrics.breakdown;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <PageViewsLineChart history={history} />
      <VisitorsBarChart hourlyHistory={hourlyHistory} />
    </div>
  );
}
