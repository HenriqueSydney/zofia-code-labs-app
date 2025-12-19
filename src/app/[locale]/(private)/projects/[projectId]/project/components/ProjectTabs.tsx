"use client";

import { usePathname, useParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation"; // Use o seu Link customizado
import { ReactNode } from "react";

interface IProjectTabs {
  children: ReactNode;
}

export function ProjectTabs({ children }: IProjectTabs) {
  const params = useParams();

  // Captura o projectId e o parentTab da URL atual
  const projectId = params.projectId as string;
  const currentTab = params.parentTab as string;

  return (
    <Tabs value={currentTab ?? "overview"} className="w-full">
      <TabsList className="w-full h-full flex-col md:flex-row flex mb-2 items-center !justify-evenly glass-effect">
        {/* Usamos asChild para que o Link controle a navegação sem "refresh" de página inteira */}

        <TabsTrigger className="cursor-pointer w-full" value="overview" asChild>
          <Link href={`/projects/${projectId}/project/overview`} scroll={false}>
            Visão Geral
          </Link>
        </TabsTrigger>

        <TabsTrigger
          className="cursor-pointer w-full"
          value="dashboard"
          asChild
        >
          <Link
            href={`/projects/${projectId}/project/dashboard`}
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
            href={`/projects/${projectId}/project/commercial`}
            scroll={false}
          >
            Comercial
          </Link>
        </TabsTrigger>

        <TabsTrigger className="cursor-pointer w-full" value="backlog" asChild>
          <Link href={`/projects/${projectId}/project/backlog`} scroll={false}>
            Backlog
          </Link>
        </TabsTrigger>

        <TabsTrigger className="cursor-pointer w-full" value="timeline" asChild>
          <Link href={`/projects/${projectId}/project/timeline`} scroll={false}>
            Prazos
          </Link>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
