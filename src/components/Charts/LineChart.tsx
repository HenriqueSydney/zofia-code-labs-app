"use client";

import {
  Line,
  LineChart as RechartsLineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomTooltip } from "@/components/Charts/CustomTooltip";
import { ChartEmptyState } from "./ChartEmptyState";

export interface LineChartCategory {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
}

interface ILineChart {
  title: string;
  description?: string;
  data: any[];
  indexKey: string;
  categories: LineChartCategory[];
  height?: number;
}

export function LineChart({
  data,
  title,
  description,
  categories,
  indexKey,
  height = 300,
}: ILineChart) {
  const hasData = data.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg">{title}</CardTitle>
        {description && (
          <CardDescription className="text-gray-400">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div
          style={{ height: `${height}px`, width: "100%" }}
          className="flex items-center justify-center"
        >
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-gray-800"
                />
                <XAxis
                  dataKey={indexKey}
                  className="text-[10px] text-gray-500"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  className="text-[10px] text-gray-500"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                {categories.map((cat) => (
                  <Line
                    key={cat.key}
                    type="monotone"
                    dataKey={cat.key}
                    stroke={cat.color}
                    name={cat.label}
                    strokeWidth={2}
                    dot={!cat.dashed}
                    strokeDasharray={cat.dashed ? "5 5" : "0"}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
