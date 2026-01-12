import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { date } from "@/lib/dayjs";
import { Calendar, Target } from "lucide-react";
import { getCachedGitHubMetrics } from "../_data/get-github-metrics";

interface ISprintProgress {
  slug: string;
}

export async function SprintProgress({ slug }: ISprintProgress) {
  // 1. Busca as métricas reais do repositório
  const metrics = await getCachedGitHubMetrics(slug);
  const { pullRequests } = metrics.activity;

  // 2. Filtra contribuidores humanos para o ranking
  const topContributors =
    metrics.repoStats.contributors
      ?.filter((c: any) => !c.login.includes("[bot]"))
      .slice(0, 3) || [];

  // 3. Cálculo de progresso baseado em PRs (Merged / Total Fechados)
  const prProgress =
    pullRequests.closedCount > 0
      ? (pullRequests.mergedCount / pullRequests.closedCount) * 100
      : 0;

  return (
    <Card className="bg-gray-900/50 border-gray-800/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-lg">
              Ciclo de Entrega
            </CardTitle>
            <CardDescription className="text-gray-400">
              Análise dos últimos 30 dias
            </CardDescription>
          </div>
          <Target className="w-5 h-5 text-purple-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progresso de PRs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Taxa de Merge</span>
              <span className="text-sm font-medium text-white">
                {pullRequests.mergedCount}/{pullRequests.closedCount} PRs
              </span>
            </div>
            <Progress value={prProgress} className="h-2 bg-gray-800" />
            <p className="text-xs text-gray-500 mt-1">
              {prProgress.toFixed(0)}% de eficiência de entrega
            </p>
          </div>

          {/* Status dos PRs (Simulando Sprint Items) */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <p className="text-2xl font-bold text-gray-400">
                {metrics.repoStats.openIssues}
              </p>
              <p className="text-xs text-gray-500">Issues</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-2xl font-bold text-blue-400">
                {pullRequests.closedCount - pullRequests.mergedCount}
              </p>
              <p className="text-xs text-blue-400/70">Declinados</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-2xl font-bold text-emerald-400">
                {pullRequests.mergedCount}
              </p>
              <p className="text-xs text-emerald-400/70">Mesclados</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>
              Período: {date().subtract(30, "days").format("DD/MM/YYYY")} -{" "}
              {date().format("DD/MM/YYYY")}
            </span>
          </div>

          {/* Top Contributors Humanos */}
          <div>
            <p className="text-sm text-gray-400 mb-3">Top Contribuidores</p>
            <div className="space-y-2">
              {topContributors.map((contributor: any, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <Avatar className="w-6 h-6">
                    <AvatarImage
                      src={`https://github.com/${contributor.login}.png`}
                    />
                    <AvatarFallback className="bg-gray-700 text-xs text-white">
                      {contributor.login.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-300 flex-1 truncate">
                    {contributor.login}
                  </span>
                  <span className="text-xs text-gray-500">
                    {contributor.contributions} contribuições
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
