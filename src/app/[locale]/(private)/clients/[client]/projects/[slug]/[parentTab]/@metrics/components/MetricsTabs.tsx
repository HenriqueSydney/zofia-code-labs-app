"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";

import {
  ChartNoAxesCombined,
  GitGraph,
  SearchCode,
  ShieldCheck,
} from "lucide-react";
import { ReactNode } from "react";

interface IMetricsTabs {
  slug: string;
  client: string;
  currentTab: string;
  children: ReactNode;
}

export function MetricsTabs({
  client,
  slug,
  currentTab,
  children,
}: IMetricsTabs) {
  const tabs = [
    { tabSlug: "life-cycle", tabName: "Ciclo de Vida", Icon: GitGraph },
    {
      tabSlug: "code-quality",
      tabName: "Qualidade de Código",
      Icon: SearchCode,
    },
    // { tabSlug: "security", tabName: "Segurança", Icon: ShieldCheck },
    {
      tabSlug: "web-analytics",
      tabName: "Web Analytics",
      Icon: ChartNoAxesCombined,
    },
  ];
  return (
    <Tabs value={currentTab ?? "life-cycle"} className="w-full ">
      <TabsList className="w-full h-full flex-col md:flex-row flex mb-2 items-center !justify-evenly glass-effect">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.tabSlug}
            className="cursor-pointer w-full flex items-center gap-2"
            value={tab.tabSlug}
            asChild
          >
            <Link
              href={`/clients/${client}/projects/${slug}/metrics/${tab.tabSlug}`}
              scroll={false}
            >
              <tab.Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.tabName}</span>
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}
