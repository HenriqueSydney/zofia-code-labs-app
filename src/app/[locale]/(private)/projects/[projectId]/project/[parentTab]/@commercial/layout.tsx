import { getParams } from "@/utils/getParams";
import { DollarSign } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { CommercialTabs } from "./components/CommercialTabs";
import { TabsContent } from "@/components/ui/tabs";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string; contextualTab: string }>;
}

export default async function ProjectLayout({ children, params }: LayoutProps) {
  const { projectId, contextualTab } = await getParams<{
    projectId: string;
    contextualTab: string;
  }>(params, ["projectId", "contextualTab"]);

  return (
    <TabsContent value="commercial" className="space-y-6 mt-6">
      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Orçamento"
          mainInformation="R$ 100.000,00"
          Icon={DollarSign}
          iconColor="bg-accent/10"
        />
        <StatsCard
          label="Orçamento"
          mainInformation="R$ 100.000,00"
          Icon={DollarSign}
          iconColor="bg-accent/10"
        />
        <StatsCard
          label="Orçamento"
          mainInformation="R$ 100.000,00"
          Icon={DollarSign}
          iconColor="bg-accent/10"
        />
        <StatsCard
          label="Orçamento"
          mainInformation="R$ 100.000,00"
          Icon={DollarSign}
          iconColor="bg-accent/10"
        />
      </div>

      {children}
    </TabsContent>
  );
}
