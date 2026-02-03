import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Plus } from "lucide-react";
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

export default function FinancialPage() {
  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
          <p className="text-muted-foreground">
            Visão geral e controle de caixa.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Suspense fallback={<FinancialStatsCardsSkeleton />}>
        <FinancialStatsCards />
      </Suspense>

      {/* Gráficos Principais */}
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

      {/* Abas de Detalhamento */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="pending">Pagamentos Pendentes</TabsTrigger>
          <TabsTrigger value="projections">Projeções</TabsTrigger>
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
