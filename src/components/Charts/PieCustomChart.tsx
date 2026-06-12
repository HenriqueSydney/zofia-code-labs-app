"use client";

import { CustomTooltip } from "@/components/Charts/CustomTooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Gamepad2,
  Laptop,
  LucideIcon,
  Tv,
  Watch,
  Monitor,
  Smartphone,
  Tablet,
  TabletSmartphone,
} from "lucide-react";
import { Cell, Pie, ResponsiveContainer, Tooltip, PieChart } from "recharts";
import { ChartContainer } from "./ChartContainer";
import { ChartEmptyState } from "./ChartEmptyState";
import { useTranslations } from "next-intl";

const pieChartIconMapper = (key: string) => {
  const icons: Record<string, LucideIcon> = {
    desktop: Monitor,
    laptop: Laptop,
    smartphone: Smartphone,
    mobile: TabletSmartphone,
    tablet: Tablet,
    tv: Tv,
    console: Gamepad2,
    watch: Watch,
  };
  return icons[key];
};

type PieData = { name: string; value: number; iconKey: string; color: string };

interface IPieChart {
  title: string;
  description: string;
  data: PieData[];
}

export function PieCustomChart({ data, title, description }: IPieChart) {
  const t = useTranslations("charts.empty");
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const hasData = total > 0;

  return (
    <Card className="!h-full !max-h-[500px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative flex min-h-0 min-w-0 items-center justify-center">
          {hasData ? (
            <ChartContainer height={250}>
              {({ width, height: chartHeight }) => (
                <ResponsiveContainer width={width} height={chartHeight}>
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartContainer>
          ) : (
            <ChartEmptyState subtitle={t("noAccessInPeriod")} />
          )}
        </div>
        <div className="mt-4 space-y-2">
          {data.map((device) => {
            const Icon = pieChartIconMapper(device.iconKey);
            return (
              <div
                key={device.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{device.name}</span>
                </div>
                <span className="font-medium">
                  {hasData
                    ? Number((device.value / total) * 100).toFixed(2)
                    : 0}
                  %
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
