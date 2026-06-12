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
  LucideIcon,
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
import { useTranslations } from "next-intl";
import { Role } from "@/generated/prisma/client";
import { PERMISSIONS } from "@/constants/permissions";

export type AdminSidebarUser = {
  role: Role;
  permissions: string[];
};

type AdminSidebarProps = {
  user: AdminSidebarUser | null;
};

type SidebarTitleKey =
  | "dashboard"
  | "clients"
  | "projects"
  | "financial"
  | "contracts"
  | "serviceCategories"
  | "serviceCatalog"
  | "expenseTypes"
  | "integrationsCatalog"
  | "integrationsConfig";

type MenuItem = {
  titleKey: SidebarTitleKey;
  url: string;
  icon: LucideIcon;
  role?: "OWNER" | "USER";
  permissions?: string;
  permissionsAny?: string[];
};

const mainMenuItems: MenuItem[] = [
  { titleKey: "dashboard", url: "/dashboard", icon: LayoutDashboard },
  { titleKey: "clients", url: "/clients", icon: UsersRound },
  { titleKey: "projects", url: "/projects", icon: FolderKanban },
  { titleKey: "financial", url: "/financial", icon: CreditCard },
  { titleKey: "contracts", url: "/contracts", icon: FileText },
];

const settingsMenuItems: MenuItem[] = [
  {
    titleKey: "serviceCategories",
    url: "/settings/services/category",
    icon: Boxes,
    permissions: PERMISSIONS.SERVICE_CATALOG.READ,
  },
  {
    titleKey: "serviceCatalog",
    url: "/settings/services/catalog",
    icon: Package,
    permissions: PERMISSIONS.SERVICE_CATALOG.READ,
  },
  {
    titleKey: "expenseTypes",
    url: "/settings/expenses-category",
    icon: Tags,
  },
  {
    titleKey: "integrationsCatalog",
    url: "/settings/integrations/catalog",
    icon: Cable,
    role: "OWNER",
  },
  {
    titleKey: "integrationsConfig",
    url: "/settings/integrations/config",
    icon: Key,
    permissionsAny: [
      PERMISSIONS.SETTINGS.READ_INTEGRATIONS,
      PERMISSIONS.SETTINGS.MANAGE_INTEGRATIONS,
    ],
  },
];

function checkPermissionToShowItem(
  item: MenuItem,
  user: AdminSidebarUser | null | undefined,
) {
  if (!item.role && !item.permissions) {
    return true;
  }

  if (!user) {
    return false;
  }

  if (item.permissionsAny?.length) {
    return item.permissionsAny.some((permission) =>
      user.permissions.includes(permission),
    );
  }

  if (item.permissions && user.permissions.includes(item.permissions)) {
    return true;
  }

  return user.role === item.role;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const t = useTranslations("navigation.sidebar");

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("mainMenu")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems
                .filter((item) => checkPermissionToShowItem(item, user))
                .map((item) => (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url} title={t(item.titleKey)}>
                        <item.icon />
                        <span>{t(item.titleKey)}</span>
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
              {t("settings")}
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsMenuItems
                .filter((item) => checkPermissionToShowItem(item, user))
                .map((item) => (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url} title={t(item.titleKey)}>
                        <item.icon />
                        <span>{t(item.titleKey)}</span>
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
