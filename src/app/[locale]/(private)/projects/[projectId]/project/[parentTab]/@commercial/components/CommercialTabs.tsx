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

interface IProjectTabs {
  projectId: string;
  currentTab: string;
  children: ReactNode;
}

export function CommercialTabs({
  projectId,
  currentTab,
  children,
}: IProjectTabs) {
  return (
    <Tabs value={currentTab ?? "proposals"} className="w-full">
      <TabsList className="w-full h-full flex-col md:flex-row flex mb-2 items-center !justify-evenly glass-effect">
        <TabsTrigger
          className="cursor-pointer w-full flex items-center gap-2"
          value="proposals"
          asChild
        >
          <Link
            href={`/projects/${projectId}/project/commercial/proposals`}
            scroll={false}
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Propostas</span>
          </Link>
        </TabsTrigger>

        <TabsTrigger
          className="cursor-pointer w-full  flex items-center gap-2"
          value="contracts"
          asChild
        >
          <Link
            href={`/projects/${projectId}/project/commercial/contracts`}
            scroll={false}
          >
            <FileSignature className="h-4 w-4" />
            <span className="hidden sm:inline">Contrato</span>
          </Link>
        </TabsTrigger>

        <TabsTrigger
          className="cursor-pointer w-full  flex items-center gap-2"
          value="payments"
          asChild
        >
          <Link
            href={`/projects/${projectId}/project/commercial/payments`}
            scroll={false}
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Pagamentos</span>
          </Link>
        </TabsTrigger>

        <TabsTrigger
          className="cursor-pointer w-full  flex items-center gap-2"
          value="expenses"
          asChild
        >
          <Link
            href={`/projects/${projectId}/project/commercial/expenses`}
            scroll={false}
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Despesas</span>
          </Link>
        </TabsTrigger>

        <TabsTrigger
          className="cursor-pointer w-full  flex items-center gap-2"
          value="notifications"
          asChild
        >
          <Link
            href={`/projects/${projectId}/project/commercial/notifications`}
            scroll={false}
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </Link>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
