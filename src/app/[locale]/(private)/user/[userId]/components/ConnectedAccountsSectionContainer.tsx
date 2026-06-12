import { getUserConnectedAccounts } from "../_data/getUserProfileSections";
import { ConnectedAccountsSection } from "./ConnectedAccountsSection";

interface ConnectedAccountsSectionContainerProps {
  userId: string;
}

export async function ConnectedAccountsSectionContainer({
  userId,
}: ConnectedAccountsSectionContainerProps) {
  const accounts = await getUserConnectedAccounts(userId);
  return <ConnectedAccountsSection accounts={accounts} />;
}
