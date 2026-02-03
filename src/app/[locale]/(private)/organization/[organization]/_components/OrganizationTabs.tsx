"use client";

import { useParams, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link"; // Ou seu link customizado de i18n
import { ReactNode } from "react";
import {
  ShieldCheck,
  Users,
  LayoutDashboard,
  CreditCard,
  Settings,
} from "lucide-react";

interface IOrganizationTabs {
  children: ReactNode;
}

export function OrganizationTabs({ children }: IOrganizationTabs) {
  const params = useParams();
  const pathname = usePathname();

  const organization = params.organization as string;

  const segments = [
    {
      key: "overview",
      name: "Visão Geral",
      href: `/organization/${organization}`,
      icon: LayoutDashboard,
    },
    {
      key: "members",
      name: "Membros & Equipe",
      href: `/organization/${organization}/members`,
      icon: Users,
    },
    {
      key: "roles",
      name: "Perfis de Acesso",
      href: `/organization/${organization}/roles`,
      icon: ShieldCheck,
    },
    {
      key: "settings", // Este valor deve bater com o TabsContent value="settings"
      name: "Configurações",
      href: `/organization/${organization}/settings`,
      icon: Settings, // Importar do lucide-react
    },
    {
      key: "billing",
      name: "Assinatura",
      href: `/organization/${organization}/billing`,
      icon: CreditCard,
    },
  ];

  // Lógica para detectar a aba ativa
  // Se for exatamente a rota base, é overview. Se não, procura no path.
  let currentTab =
    segments.find(
      (segment) => segment.key !== "overview" && pathname.includes(segment.key),
    )?.key || "overview";

  return (
    <Tabs value={currentTab} className="w-full">
      <TabsList className="w-full h-full flex-col md:flex-row flex mb-6 items-center !justify-start glass-effect p-1 gap-2 bg-muted/50">
        {segments.map((s) => {
          const Icon = s.icon;
          return (
            <TabsTrigger
              key={s.key}
              value={s.key}
              className="cursor-pointer w-full px-6 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              asChild
            >
              <Link href={s.href} scroll={false} className="flex items-center">
                <Icon size={16} />
                {s.name}
              </Link>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {children}
    </Tabs>
  );
}
