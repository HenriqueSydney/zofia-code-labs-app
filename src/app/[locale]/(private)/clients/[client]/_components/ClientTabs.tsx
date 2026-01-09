"use client";

import { useParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, usePathname } from "@/i18n/navigation"; // Use o seu Link customizado
import { ReactNode } from "react";

interface IClientTabs {
  children: ReactNode;
}

export function ClientTabs({ children }: IClientTabs) {
  const params = useParams();
  const pathname = usePathname();

  // Captura o projectId e o parentTab da URL atual
  const client = params.client as string;

  const segments = [
    { key: "overview", name: "Overview", href: `/clients/${client}` },
    {
      key: "dashboard",
      name: "Dashboard",
      href: `/clients/${client}/dashboard`,
    },
    { key: "projects", name: "Projetos", href: `/clients/${client}/projects` },
    {
      key: "contracts",
      name: "Contratos",
      href: `/clients/${client}/contracts`,
    },
    {
      key: "analytics",
      name: "Analytics",
      href: `/clients/${client}/analytics`,
    },
    { key: "metrics", name: "Métricas", href: `/clients/${client}/metrics` },
    {
      key: "reports",
      name: "ZofIA Reports",
      href: `/clients/${client}/ai-reports`,
    },
  ];

  let currentTab = segments.find((segment) =>
    pathname.includes(segment.key)
  )?.key;

  // Verifica se a rota atual contém /projects
  const isProjectList =
    pathname.endsWith("/projects") || pathname.endsWith("/projects/");
  const isInsideProject = pathname.includes("/projects") && !isProjectList;

  if (isInsideProject) return children;

  return (
    <Tabs value={currentTab ?? "overview"} className="w-full">
      <TabsList className="w-full h-full flex-col md:flex-row flex mb-2 items-center !justify-evenly glass-effect">
        {segments.map((s) => (
          <TabsTrigger
            key={s.key}
            value={s.key}
            className="cursor-pointer w-full"
            asChild
          >
            <Link href={s.href} scroll={false}>
              {s.name}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}
