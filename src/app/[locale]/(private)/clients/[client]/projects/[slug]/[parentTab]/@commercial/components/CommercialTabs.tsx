"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";

import {
  Bell,
  CreditCard,
  FileSignature,
  FileText,
  Receipt,
} from "lucide-react";
import { ReactNode } from "react";
import { useTranslations } from "next-intl";

interface IProjectTabs {
  slug: string;
  client: string;
  currentTab: string;
  children: ReactNode;
}

export function CommercialTabs({
  client,
  slug,
  currentTab,
  children,
}: IProjectTabs) {
  const t = useTranslations("projects.commercial.tabs");

  return (
    <Tabs value={currentTab ?? "proposals"} className="w-full ">
      <TabsList className="w-full h-full flex-col md:flex-row flex mb-2 items-center !justify-evenly glass-effect">
        <TabsTrigger
          className="cursor-pointer w-full flex items-center gap-2"
          value="proposals"
          asChild
        >
          <Link
            href={`/clients/${client}/projects/${slug}/commercial/proposals`}
            scroll={false}
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{t("proposals")}</span>
          </Link>
        </TabsTrigger>

        <TabsTrigger
          className="cursor-pointer w-full  flex items-center gap-2"
          value="contracts"
          asChild
        >
          <Link
            href={`/clients/${client}/projects/${slug}/commercial/contracts`}
            scroll={false}
          >
            <FileSignature className="h-4 w-4" />
            <span className="hidden sm:inline">{t("contracts")}</span>
          </Link>
        </TabsTrigger>

        <TabsTrigger
          className="cursor-pointer w-full  flex items-center gap-2"
          value="payments"
          asChild
        >
          <Link
            href={`/clients/${client}/projects/${slug}/commercial/payments`}
            scroll={false}
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">{t("payments")}</span>
          </Link>
        </TabsTrigger>

        <TabsTrigger
          className="cursor-pointer w-full  flex items-center gap-2"
          value="expenses"
          asChild
        >
          <Link
            href={`/clients/${client}/projects/${slug}/commercial/expenses`}
            scroll={false}
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">{t("expenses")}</span>
          </Link>
        </TabsTrigger>

        <TabsTrigger
          className="cursor-pointer w-full  flex items-center gap-2"
          value="notifications"
          asChild
        >
          <Link
            href={`/clients/${client}/projects/${slug}/commercial/notifications`}
            scroll={false}
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">{t("notifications")}</span>
          </Link>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
