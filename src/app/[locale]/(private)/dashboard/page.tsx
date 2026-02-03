// app/dashboard/page.tsx
import { Suspense } from "react";
import {
  StatsCards,
  StatsCardsSkeletonContainer,
} from "./_components/StatsCards";
import { ProjectsChart } from "./_components/ProjectsChart";
import { RecentProjectsList } from "./_components/RecentProjectsList";
import { BarChartSkeleton } from "@/components/skeletons/BarChartSkeleton";
import { ListSkeleton } from "@/components/skeletons/ListSkeleton";
import { LineChartSkeleton } from "@/components/skeletons/LineChartSkeleton";
import { BacklogEvolutionChart } from "./_components/BacklogEvolutionChart";

export default function DashboardPage() {

  return (
    <div className="space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral da sua Software House.
        </p>
      </div>

      {/* Bloco 1: Cards de Estatísticas */}
      <Suspense fallback={<StatsCardsSkeletonContainer />}>
        <StatsCards />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Bloco 2: Gráfico (Ocupa 4 colunas) */}
        <div className="col-span-3">
          <Suspense fallback={<BarChartSkeleton />}>
            <ProjectsChart />
          </Suspense>
        </div>
        <div className="col-span-4">
          <Suspense fallback={<LineChartSkeleton />}>
            <BacklogEvolutionChart />
          </Suspense>
        </div>
      </div>
      {/* Bloco 3: Lista Recente (Ocupa 3 colunas) */}

      <Suspense fallback={<ListSkeleton />}>
        <RecentProjectsList />
      </Suspense>
    </div>
  );
}
