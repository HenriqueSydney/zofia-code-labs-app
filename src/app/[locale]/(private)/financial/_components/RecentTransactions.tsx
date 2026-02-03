import { getRecentTransactionsAction } from "@/actions/stats/getRecentTransactionsAction";
import { RecentTransactionsTableClient } from "./RecentTransactionsTableClient";

export async function RecentTransactions() {
  const { data } = await getRecentTransactionsAction();

  if (!data) return null;

  return <RecentTransactionsTableClient transactions={data} />;
}
