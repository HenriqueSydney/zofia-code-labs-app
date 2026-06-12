"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface HistoryData {
  date: string;
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
}

export function IssueEvolutionChart({ data }: { data: HistoryData[] }) {
  const tChart = useTranslations("projects.metrics.codeQuality.charts.issueEvolution");
  const tSummary = useTranslations("projects.metrics.codeQuality.summary");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{tChart("title")}</CardTitle>
        <CardDescription>{tChart("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBugs" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--destructive))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--destructive))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderRadius: "8px",
                  borderColor: "hsl(var(--border))",
                }}
              />
              <Legend verticalAlign="top" height={36} />

              <Area
                type="monotone"
                dataKey="codeSmells"
                stackId="1"
                stroke="#eab308"
                fill="#eab308"
                fillOpacity={0.2}
                name={tSummary("codeSmells")}
              />
              <Area
                type="monotone"
                dataKey="vulnerabilities"
                stackId="1"
                stroke="#ea580c"
                fill="#ea580c"
                fillOpacity={0.3}
                name={tChart("vulnerabilities")}
              />
              <Area
                type="monotone"
                dataKey="bugs"
                stackId="1"
                stroke="hsl(var(--destructive))"
                fill="url(#colorBugs)"
                name={tSummary("bugs")}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
