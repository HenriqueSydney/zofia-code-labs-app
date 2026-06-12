import { getUserLoginHistory } from "../_data/getUserProfileSections";
import { LoginHistorySection } from "./LoginHistorySection";

interface LoginHistorySectionContainerProps {
  userId: string;
}

export async function LoginHistorySectionContainer({
  userId,
}: LoginHistorySectionContainerProps) {
  const history = await getUserLoginHistory(userId);
  return <LoginHistorySection history={history} />;
}
