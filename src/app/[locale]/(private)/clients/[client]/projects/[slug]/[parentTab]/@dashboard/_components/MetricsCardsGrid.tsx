import { StatsCard } from "@/components/StatsCard";
import { CheckCircle, Clock, Code, Shield, ListTodo } from "lucide-react";
import { getCachedBacklogMetrics } from "../_data/get-cached-backlog-metrics";
import { getCachedFinancialMetrics } from "../_data/get-cached-financial-metrics";

export async function MetricsCardsGrid({ slug }: { slug: string }) {
  // Chamadas reais às actions através do cache
  const [backlogMetrics, financialMetrics] = await Promise.all([
    getCachedBacklogMetrics(slug),
    getCachedFinancialMetrics(slug),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {/* Dados vindos do GetBacklogMetrics UseCase */}
      <StatsCard
        label="Total de Tarefas"
        mainInformation={backlogMetrics.cards.totalTasks}
        trend={backlogMetrics.cards.trends.tasks}
        Icon={ListTodo}
        iconColor="bg-blue-500/10"
        reverseColor={false}
      />

      <StatsCard
        label="Tarefas concluídas"
        mainInformation={backlogMetrics.cards.completedTasks}
        trend={backlogMetrics.cards.trends.completed}
        Icon={CheckCircle}
        iconColor="bg-green-500/10"
        reverseColor={false}
      />

      <StatsCard
        label="Progresso"
        mainInformation={backlogMetrics.cards.progress}
        trend={backlogMetrics.cards.trends.progress}
        Icon={Code}
        iconColor="bg-primary/10"
        reverseColor={false}
      />

      {/* Dados vindos do GetFinancialMetrics UseCase */}
      <StatsCard
        label="Valores Recebidos"
        mainInformation={financialMetrics.cards.totalReceived}
        trend={financialMetrics.cards.trends.received}
        Icon={Shield}
        iconColor="bg-green-500/10"
        reverseColor={false}
      />

      <StatsCard
        label="Despesas"
        mainInformation={financialMetrics.cards.totalExpenses}
        trend={financialMetrics.cards.trends.expenses}
        Icon={Clock}
        iconColor="bg-destructive/10"
        reverseColor={true}
      />
    </div>
  );
}
