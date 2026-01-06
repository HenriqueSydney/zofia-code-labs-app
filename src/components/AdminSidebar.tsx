"use client";

import {
  FolderKanban,
  CreditCard,
  FileText,
  Settings,
  Package,
  FileStack,
  Tags,
  Key,
  LayoutDashboard,
  UsersRound,
  Boxes,
  Cable,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@/i18n/navigation";

const mainMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Clientes", url: "/clients", icon: UsersRound },
  { title: "Projetos", url: "/projects", icon: FolderKanban },
  { title: "Financeiro", url: "/financial", icon: CreditCard },
  { title: "Contratos", url: "/contracts", icon: FileText },
];

const settingsMenuItems = [
  {
    title: "Categorias de Serviço",
    url: "/settings/services/category",
    icon: Boxes,
  },
  {
    title: "Catálogo de Serviços",
    url: "/settings/services/catalog",
    icon: Package,
  },
  {
    title: "Tipos de Despesas",
    url: "/settings/expenses-category",
    icon: Tags,
  },
  {
    title: "Modelos de Documentos",
    url: "/settings/templates",
    icon: FileStack,
  },

  {
    title: "Catálogo de Integrações",
    url: "/settings/integrations/catalog",
    icon: Cable,
  },
  {
    title: "Configurar Integrações",
    url: "/settings/integrations/config",
    icon: Key,
  },
];

export function AdminSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} title={item.title}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            <Settings />
            <span className="ml-1 group-data-[collapsible=icon]:hidden">
              Configurações
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} title={item.title}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
