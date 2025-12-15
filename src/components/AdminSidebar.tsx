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
    title: "Categoria de Serviços",
    url: "/settings/services/category",
    icon: Package,
  },
  {
    title: "Catálogo de Serviços",
    url: "/settings/services/catalog",
    icon: Package,
  },
  {
    title: "Modelos de Documentos",
    url: "/settings/templates",
    icon: FileStack,
  },
  {
    title: "Tipos de Despesa/Receita",
    url: "/settings/expense-types",
    icon: Tags,
  },
  { title: "Integrações", url: "/settings/integrations", icon: Key },
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
                    <Link href={item.url}>
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
            <span className="group-data-[collapsible=icon]:hidden">
              Configurações
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
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
