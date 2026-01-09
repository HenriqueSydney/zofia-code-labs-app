"use client";

import { CustomLegend } from "@/components/Charts/CustomLegend";
import { CustomTooltip } from "@/components/Charts/CustomTooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { date } from "@/lib/dayjs";
import { UmamiHistoryResponse } from "@/services/webAnalytics/IWebAnalyticsService";
import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface IPageViewsLineChart {
  history: UmamiHistoryResponse;
}

export function PageViewsLineChart({ history }: IPageViewsLineChart) {
  const visitorsTrendData = history.pageviews.map((pv, index) => {
    const session = history.sessions[index];
    return {
      date: date(pv.x).format("DD/MMM"),
      visitors: session?.y || 0,
      pageViews: pv.y,
    };
  });
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Visitantes e Page Views</CardTitle>
        <CardDescription>Tendência dos últimos 14 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visitorsTrendData}>
              <defs>
                <linearGradient id="colorPV" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                content={<CustomLegend />}
                verticalAlign="top"
                align="right"
              />
              <Area
                type="monotone"
                dataKey="pageViews"
                stackId="1"
                stroke="hsl(221 83% 53%)"
                fill="hsl(221 83% 53% / 0.3)"
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stackId="2"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.5)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
