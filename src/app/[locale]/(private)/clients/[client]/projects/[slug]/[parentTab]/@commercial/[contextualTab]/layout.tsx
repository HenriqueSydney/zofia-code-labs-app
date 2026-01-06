import { getParams } from "@/utils/getParams";
import { CommercialTabs } from "../components/CommercialTabs";

interface LayoutProps {
  proposals: React.ReactNode;
  contracts: React.ReactNode;
  payments: React.ReactNode;
  expenses: React.ReactNode;
  notifications: React.ReactNode;
  children: React.ReactNode;
  params: Promise<{ slug: string; contextualTab: string; client: string }>;
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
  const { slug, contextualTab, client } = await getParams<{
    slug: string;
    contextualTab: string;
    client: string;
  }>(params, ["slug", "contextualTab", "client"]);

  {
    children;
  }
  return (
    <CommercialTabs client={client} slug={slug} currentTab={contextualTab}>
      {contextualTab === "proposals" && proposals}
      {contextualTab === "contracts" && contracts}
      {contextualTab === "payments" && payments}
      {contextualTab === "expenses" && expenses}
      {contextualTab === "notifications" && notifications}
    </CommercialTabs>
  );
}
