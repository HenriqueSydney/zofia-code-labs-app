"use client";

import { useParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation"; // Use o seu Link customizado
import { ReactNode } from "react";
import {
  Handshake,
  History,
  LayoutDashboard,
  ListTodo,
  Target,
  TrendingUp,
} from "lucide-react";

interface IProjectTabs {
  children: ReactNode;
}

export function ProjectTabs({ children }: IProjectTabs) {
  const params = useParams();

  // Captura o projectId e o parentTab da URL atual
  const client = params.client as string;
  const slug = params.slug as string;
  const currentTab = params.parentTab as string;

  const tabs = [
    { tabSlug: "overview", tabName: "Visão Geral", Icon: Target },
    {
      tabSlug: "dashboard",
      tabName: "Dashboard",
      Icon: LayoutDashboard,
    },
    { tabSlug: "commercial", tabName: "Comercial", Icon: Handshake },
    {
      tabSlug: "backlog",
      tabName: "Backlogs",
      Icon: ListTodo,
    },
    {
      tabSlug: "timeline",
      tabName: "Prazos",
      Icon: History,
    },
    {
      tabSlug: "metrics",
      tabName: "Métricas",
      Icon: TrendingUp,
    },
  ];

  return (
    <Tabs value={currentTab ?? "overview"} className="w-full">
      <TabsList className="w-full h-full flex-col md:flex-row flex mb-2 items-center !justify-evenly glass-effect">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.tabSlug}
            className="cursor-pointer w-full flex items-center gap-2"
            value={tab.tabSlug}
            asChild
          >
            <Link
              href={`/clients/${client}/projects/${slug}/${tab.tabSlug}`}
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
