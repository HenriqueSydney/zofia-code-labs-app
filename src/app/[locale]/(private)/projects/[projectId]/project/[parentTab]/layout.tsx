import { getParams } from "@/utils/getParams";

interface LayoutProps {
  overview: React.ReactNode;
  commercial: React.ReactNode;
  params: Promise<{ projectId: string; parentTab: string }>;
}

export default async function ProjectLayout({
  overview,
  commercial,
  params,
}: LayoutProps) {
  const { parentTab } = await getParams<{
    parentTab: string;
  }>(params, ["parentTab"]);

  return (
    <>
      {parentTab === "overview" && overview}
      {parentTab === "commercial" && commercial}
    </>
  );
}
