"use client";

import { Building2, LayoutDashboard } from "lucide-react";
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
import type { SessionClientMembership } from "@/@types/next-auth";

type ClientSidebarProps = {
  clientMemberships: SessionClientMembership[];
};

export function ClientSidebar({ clientMemberships }: ClientSidebarProps) {
  const t = useTranslations("clientPortal.sidebar");
  const memberships = clientMemberships;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("title")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/minhas-empresas" title={t("companies")}>
                    <LayoutDashboard />
                    <span>{t("companies")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {memberships.filter((m) => m.status === "ACTIVE").length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("quickAccess")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {memberships
                  .filter((m) => m.status === "ACTIVE")
                  .map((membership) => (
                    <SidebarMenuItem key={membership.clientId}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={`/clients/${membership.clientSlug}/dashboard`}
                          title={membership.tradeName}
                        >
                          <Building2 />
                          <span>{membership.tradeName}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
