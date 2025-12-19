import { getParams } from "@/utils/getParams";
import { CommercialTabs } from "../components/CommercialTabs";

interface LayoutProps {
  proposals: React.ReactNode;
  contracts: React.ReactNode;
  payments: React.ReactNode;
  expenses: React.ReactNode;
  notifications: React.ReactNode;
  children: React.ReactNode;
  params: Promise<{ projectId: string; contextualTab: string }>;
}

export default async function CommercialLayout({
  proposals,
  contracts,
  payments,
  expenses,
  notifications,
  params,
  children,
}: LayoutProps) {
  const { projectId, contextualTab } = await getParams<{
    projectId: string;
    contextualTab: string;
  }>(params, ["projectId", "contextualTab"]);

  {
    children;
  }
  return (
    <CommercialTabs projectId={projectId} currentTab={contextualTab}>
      {contextualTab === "proposals" && proposals}
      {contextualTab === "contracts" && contracts}
      {contextualTab === "payments" && payments}
      {contextualTab === "expenses" && expenses}
      {contextualTab === "notifications" && notifications}
    </CommercialTabs>
  );
}
