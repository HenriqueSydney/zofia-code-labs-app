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
import { getTranslations } from "next-intl/server";
import { getCachedGitHubMetrics } from "../_data/get-github-metrics";

interface ISprintProgress {
  slug: string;
}

export async function SprintProgress({ slug }: ISprintProgress) {
  const t = await getTranslations("projects.metrics.lifecycle.sprint");
  const metrics = await getCachedGitHubMetrics(slug);
  const { pullRequests } = metrics.activity;

  const topContributors =
    metrics.repoStats.contributors
      ?.filter((c: any) => !c.login.includes("[bot]"))
      .slice(0, 3) || [];

  const prProgress =
    pullRequests.closedCount > 0
      ? (pullRequests.mergedCount / pullRequests.closedCount) * 100
      : 0;

  const periodStart = date().subtract(30, "days").format("DD/MM/YYYY");
  const periodEnd = date().format("DD/MM/YYYY");

  return (
    <Card className="bg-gray-900/50 border-gray-800/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-lg">{t("title")}</CardTitle>
            <CardDescription className="text-gray-400">
              {t("description")}
            </CardDescription>
          </div>
          <Target className="w-5 h-5 text-purple-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{t("mergeRate")}</span>
              <span className="text-sm font-medium text-white">
                {t("prsCount", {
                  merged: pullRequests.mergedCount,
                  closed: pullRequests.closedCount,
                })}
              </span>
            </div>
            <Progress value={prProgress} className="h-2 bg-gray-800" />
            <p className="text-xs text-gray-500 mt-1">
              {t("deliveryEfficiency", {
                percent: prProgress.toFixed(0),
              })}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-gray-800/50">
              <p className="text-2xl font-bold text-gray-400">
                {metrics.repoStats.openIssues}
              </p>
              <p className="text-xs text-gray-500">{t("issues")}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-2xl font-bold text-blue-400">
                {pullRequests.closedCount - pullRequests.mergedCount}
              </p>
              <p className="text-xs text-blue-400/70">{t("declined")}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-2xl font-bold text-emerald-400">
                {pullRequests.mergedCount}
              </p>
              <p className="text-xs text-emerald-400/70">{t("merged")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>
              {t("period", { start: periodStart, end: periodEnd })}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-3">{t("topContributors")}</p>
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
                    {t("contributions", {
                      count: contributor.contributions,
                    })}
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
