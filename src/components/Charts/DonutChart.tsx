"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "./ChartContainer";
import { ChartEmptyState } from "./ChartEmptyState";

interface DonutChartProps {
  title: string;
  description: string;
  data: { name: string; value: number }[];
  colors: Record<string, string>;
  defaultColor?: string;
  height?: number;
}

export function DonutChart({
  title,
  description,
  data,
  colors,
  defaultColor = "#8884d8",
  height = 250,
}: DonutChartProps) {
  const hasData = data.length > 0 && data.some((item) => item.value > 0);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">{title}</CardTitle>
        <CardDescription className="text-gray-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="flex w-full min-w-0 items-center justify-center">
          {hasData ? (
            <ChartContainer height={height}>
              {({ width, height: chartHeight }) => (
                <ResponsiveContainer width={width} height={chartHeight}>
                  <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--accent))",
                    borderRadius: "8px",
                    borderColor: "hsl(var(--border))",
                    fontSize: "12px",
                    color: "white",
                  }}
                  itemStyle={{ color: "white" }}
                />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) =>
                    value > 0 ? `${name}: ${value}` : ""
                  }
                  labelLine={{ strokeWidth: 1 }}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[entry.name] || defaultColor}
                      stroke="none"
                    />
                  ))}
                </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartContainer>
          ) : (
            <ChartEmptyState />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
