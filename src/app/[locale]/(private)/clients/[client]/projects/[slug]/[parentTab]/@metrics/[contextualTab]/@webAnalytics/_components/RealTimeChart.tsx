"use client";

import { fetchUmamiRealTimeVisitorsAction } from "@/actions/integrations/umami/fetchUmamiRealTimeVisitorsAction";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Data = {
  page: string;
  visitors: number;
};

interface IRealTimeChart {
  slug: string;
}

export function RealTimeChart({ slug }: IRealTimeChart) {
  const t = useTranslations("projects.metrics.webAnalytics.realTime");
  const [data, setData] = useState<Data[]>([]);

  const handleFetchRealTimeVisitors = async () => {
    const result = await fetchUmamiRealTimeVisitorsAction(slug);
    if (result.success && result.data) {
      setData(result.data);
    }
  };

  useEffect(() => {
    handleFetchRealTimeVisitors();
  }, [slug]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="h-full">
        <div className="space-y-4 h-full">
          {data.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-500">
              <span className="text-sm font-medium">{t("noData")}</span>
              <span className="text-xs">{t("noAccess")}</span>
            </div>
          )}
          {data.map((visitor, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50"
            >
              <div className="flex items-center gap-2 truncate flex-1">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="truncate text-xs">{visitor.page}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{visitor.visitors}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
