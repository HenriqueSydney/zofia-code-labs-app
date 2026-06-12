import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { date } from "@/lib/dayjs";
import { GitCommit } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCachedGitHubMetrics } from "../_data/get-github-metrics";

interface IActivityTable {
  slug: string;
}

export async function ActivityTable({ slug }: IActivityTable) {
  const t = await getTranslations("projects.metrics.lifecycle.activity");
  const metrics = await getCachedGitHubMetrics(slug);
  const commits = metrics.activity.commits.commitsRaw || [];

  return (
    <Card className="bg-gray-900/50 border-gray-800/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">{t("title")}</CardTitle>
        <CardDescription className="text-gray-400">
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative min-h-[200px]">
          {commits.length > 0 ? (
            <>
              <div className="absolute left-[19px] top-2 bottom-4 w-px bg-gray-800" />
              <div className="space-y-6">
                {commits.map((commit: any) => {
                  const authorLogin = commit.author?.login || "Unknown";
                  const avatarUrl = commit.author?.avatar_url;
                  const message = commit.commit?.message?.split("\n")[0];
                  const shaShort = commit.sha.substring(0, 7);
                  const commitDate = commit.commit?.author?.date;

                  return (
                    <div key={commit.sha} className="relative flex gap-4">
                      <div className="relative z-10">
                        <Avatar className="w-10 h-10 border-2 border-gray-900">
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback className="bg-gray-700 text-sm text-white">
                            {authorLogin.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm text-gray-200 truncate font-medium">
                              {message}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                {authorLogin}
                              </span>
                              <span className="text-gray-700">•</span>
                              <a
                                href={commit.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded hover:bg-blue-500/20 transition-colors"
                              >
                                {shaShort}
                              </a>
                            </div>
                          </div>
                          <span className="text-[11px] text-gray-500 whitespace-nowrap mt-1">
                            {date(commitDate).fromNow()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <div className="bg-gray-800/30 p-4 rounded-full mb-3">
                <GitCommit className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-medium">{t("noCommits")}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
