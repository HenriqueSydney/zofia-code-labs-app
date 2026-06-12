import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, Inbox } from "lucide-react";
import { getCachedClientBlockers } from "../_data/get-cached-client-blockers";
import { cn } from "@/utils/twMerge";
import { getTranslations } from "next-intl/server";

interface IBlockerContainer {
  slug: string;
}

export async function BlockerContainer({ slug }: IBlockerContainer) {
  const t = await getTranslations("clients.dashboard.blockers");
  const data = await getCachedClientBlockers(slug);

  return (
    <Card
      className={cn(
        "h-[400px] flex flex-col",
        data.length > 0 && "border-orange-500/20 bg-orange-500/5",
        data.length === 0 && "border-green-500/20 bg-green-500/5",
      )}
    >
      <CardHeader>
        <CardTitle
          className={cn(
            "flex items-center gap-2",
            data.length > 0 && "text-orange-600 dark:text-orange-400",
            data.length === 0 && "text-green-600 dark:text-green-400",
          )}
        >
          {data.length === 0 && <CheckCircle className="h-5 w-5" />}
          {data.length > 0 && <AlertCircle className="h-5 w-5" />} {t("title")}
        </CardTitle>
        <CardDescription>
          {t("description", { count: data.length })}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1 pr-4 custom-scrollbar">
        {data.length > 0 && (
          <ul className="space-y-4">
            {data.map((blocker) => (
              <li
                key={blocker.id}
                className="flex items-center justify-between gap-1 border-b pb-4 last:border-0"
              >
                <span className="text-sm font-medium">{blocker.title}</span>
                <Badge
                  variant="outline"
                  className="w-fit text-[10px] uppercase"
                >
                  {blocker.priority}
                </Badge>
              </li>
            ))}
          </ul>
        )}

        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center text-gray-500 animate-in fade-in duration-500 w-full h-full">
            <div className="bg-gray-800/50 p-4 rounded-full mb-3">
              <Inbox className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm font-medium">{t("emptyTitle")}</p>
            <p className="text-xs opacity-50">{t("emptyDescription")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
