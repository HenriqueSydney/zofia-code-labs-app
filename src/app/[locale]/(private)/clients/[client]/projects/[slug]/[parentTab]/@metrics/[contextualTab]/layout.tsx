import { getParams } from "@/utils/getParams";
import { MetricsTabs } from "../components/MetricsTabs";

interface LayoutProps {
  lifeCycle: React.ReactNode;
  webAnalytics: React.ReactNode;
  codeQuality: React.ReactNode;
  children: React.ReactNode;
  params: Promise<{ slug: string; contextualTab: string; client: string }>;
}

export default async function IntegrationsLayout({
  lifeCycle,
  webAnalytics,
  codeQuality,
  params,
  children,
}: LayoutProps) {
  const { slug, contextualTab, client } = await getParams<{
    slug: string;
    contextualTab: string;
    client: string;
  }>(params, ["slug", "contextualTab", "client"]);

  return (
    <MetricsTabs client={client} slug={slug} currentTab={contextualTab}>
      {lifeCycle}
      {webAnalytics}
      {codeQuality}
      {children}
    </MetricsTabs>
  );
}
