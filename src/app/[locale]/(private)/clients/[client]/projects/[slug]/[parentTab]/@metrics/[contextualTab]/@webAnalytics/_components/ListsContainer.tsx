import { getCachedUmamiMetrics } from "../_data/get-umami-metrics";
import { ListsDetails } from "./ListsDetails";

interface IListsContainer {
  slug: string;
}

export async function ListsContainer({ slug }: IListsContainer) {
  const metrics = await getCachedUmamiMetrics(slug);

  if (!metrics) return null;

  return <ListsDetails metrics={metrics} />;
}
