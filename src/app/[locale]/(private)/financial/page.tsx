import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import {
  FinancialStatsCards,
  FinancialStatsCardsSkeleton,
} from "./_components/FinancialStatsCards";
import { FinancialOverviewChart } from "./_components/FinancialOverviewChart";
import { ExpensesCategoryChart } from "./_components/ExpensesCategoryChart";
import { RecentTransactions } from "./_components/RecentTransactions";
import { PendingSettlements } from "./_components/PendingSettlements";
import { FinancialProjections } from "./_components/FinancialProjections";
import { LineChartSkeleton } from "@/components/skeletons/LineChartSkeleton";
import { PieChartSkeleton } from "@/components/skeletons/PieSkeleton";
import { ListSkeleton } from "@/components/skeletons/ListSkeleton";
import { hasPermission } from "@/utils/hasPermission";
import { auth } from "@/auth";
import { PERMISSIONS } from "@/constants/permissions";

export default async function FinancialPage() {
  const t = await getTranslations("financial.page");
  const session = await auth();
  const canCreate = hasPermission(session?.user, PERMISSIONS.FINANCIAL.CREATE);
  const canExport = hasPermission(session?.user, PERMISSIONS.FINANCIAL.EXPORT);
  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          {canExport && (
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t("export")}
            </Button>
          )}
          {canCreate && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("newTransaction")}
            </Button>
          )}
        </div>
      </div>

      <Suspense fallback={<FinancialStatsCardsSkeleton />}>
        <FinancialStatsCards />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Suspense
          fallback={
            <div className="col-span-2">
              <LineChartSkeleton />
            </div>
          }
        >
          <FinancialOverviewChart />
        </Suspense>

        <Suspense fallback={<PieChartSkeleton />}>
          <ExpensesCategoryChart />
        </Suspense>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">
            {t("tabs.transactions")}
          </TabsTrigger>
          <TabsTrigger value="pending">{t("tabs.pending")}</TabsTrigger>
          <TabsTrigger value="projections">{t("tabs.projections")}</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Suspense fallback={<ListSkeleton />}>
            <RecentTransactions />
          </Suspense>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Suspense fallback={<ListSkeleton />}>
            <PendingSettlements />
          </Suspense>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Suspense fallback={<ListSkeleton />}>
            <FinancialProjections />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
