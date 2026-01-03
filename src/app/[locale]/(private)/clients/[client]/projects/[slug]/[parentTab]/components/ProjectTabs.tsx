"use client";

import { useParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation"; // Use o seu Link customizado
import { ReactNode } from "react";

interface IProjectTabs {
  children: ReactNode;
}

export function ProjectTabs({ children }: IProjectTabs) {
  const params = useParams();

  // Captura o projectId e o parentTab da URL atual
  const client = params.client as string;
  const slug = params.slug as string;
  const currentTab = params.parentTab as string;

  return (
    <Tabs value={currentTab ?? "overview"} className="w-full">
      <TabsList className="w-full h-full flex-col md:flex-row flex mb-2 items-center !justify-evenly glass-effect">
        <TabsTrigger className="cursor-pointer w-full" value="overview" asChild>
          <Link
            href={`/clients/${client}/projects/${slug}/overview`}
            scroll={false}
          >
            Visão Geral
          </Link>
        </TabsTrigger>

        <TabsTrigger
          className="cursor-pointer w-full"
          value="dashboard"
          asChild
        >
          <Link
            href={`/clients/${client}/projects/${slug}/dashboard`}
            scroll={false}
          >
            Dashboard
          </Link>
        </TabsTrigger>

        <TabsTrigger
          className="cursor-pointer w-full"
          value="commercial"
          asChild
        >
          <Link
            href={`/clients/${client}/projects/${slug}/commercial`}
            scroll={false}
          >
            Comercial
          </Link>
        </TabsTrigger>

        <TabsTrigger className="cursor-pointer w-full" value="backlog" asChild>
          <Link
            href={`/clients/${client}/projects/${slug}/backlog`}
            scroll={false}
          >
            Backlog
          </Link>
        </TabsTrigger>

        <TabsTrigger className="cursor-pointer w-full" value="timeline" asChild>
          <Link
            href={`/clients/${client}/projects/${slug}/timeline`}
            scroll={false}
          >
            Prazos
          </Link>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
