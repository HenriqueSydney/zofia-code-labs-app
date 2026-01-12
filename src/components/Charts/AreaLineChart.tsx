"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CustomTooltip } from "@/components/Charts/CustomTooltip";
import { CustomLegend } from "@/components/Charts/CustomLegend";
import { ChartEmptyState } from "./ChartEmptyState";

export interface ChartCategory {
  key: string;
  label: string;
  color: string;
}

interface AreaLineChartProps {
  title: string;
  description: string;
  data: any[];
  indexKey: string;
  categories: ChartCategory[];
  height?: number;
}

export function AreaLineChart({
  title,
  description,
  data,
  indexKey,
  categories,
  height = 250,
}: AreaLineChartProps) {
  const hasData = data.length > 0;

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          style={{ height: `${height}px`, width: "100%" }}
          className="flex items-center justify-center"
        >
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  {categories.map((cat) => (
                    <linearGradient
                      key={`grad-${cat.key}`}
                      id={`color-${cat.key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={cat.color}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={cat.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis
                  dataKey={indexKey}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  stroke="#94a3b8"
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#1e293b", strokeWidth: 1 }}
                />
                <Legend
                  content={<CustomLegend />}
                  verticalAlign="top"
                  align="right"
                />
                {categories.map((cat) => (
                  <Area
                    key={cat.key}
                    type="monotone"
                    dataKey={cat.key}
                    name={cat.label}
                    stroke={cat.color}
                    fill={`url(#color-${cat.key})`}
                    strokeWidth={2}
                    stackId="1"
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
