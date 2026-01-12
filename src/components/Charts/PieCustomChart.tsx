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
import { ChartEmptyState } from "./ChartEmptyState";

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
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const hasData = total > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full min-h-[250px] relative flex items-center justify-center">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
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
          ) : (
            <ChartEmptyState subtitle="Nenhum acesso registrado no período" />
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
