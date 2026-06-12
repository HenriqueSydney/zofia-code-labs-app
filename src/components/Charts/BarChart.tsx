"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
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
import { ChartContainer } from "./ChartContainer";
import { ChartEmptyState } from "./ChartEmptyState";

export interface ChartCategory {
  key: string;
  label: string;
  color: string;
}

interface IBarChart {
  title: string;
  description: string;
  data: any[];
  indexKey: string; // Chave para o eixo X (ex: "name")
  categories: ChartCategory[];
  height?: number;
}

export function BarChart({
  data,
  title,
  description,
  categories,
  indexKey,
  height = 250,
}: IBarChart) {
  // Verifica se há dados no array para exibição
  const hasData = data && data.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white text-lg">{title}</CardTitle>
        <CardDescription className="text-gray-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-0 min-w-0 items-center justify-center">
          {hasData ? (
            <ChartContainer height={height}>
              {({ width, height: chartHeight }) => (
                <ResponsiveContainer width={width} height={chartHeight}>
                  <RechartsBarChart
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
                />
                <YAxis
                  className="text-[10px] text-gray-500"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />

                {/* Renderização dinâmica das barras baseada nas categorias */}
                {categories.map((cat) => (
                  <Bar
                    key={cat.key}
                    dataKey={cat.key}
                    fill={cat.color}
                    name={cat.label}
                    radius={[4, 4, 0, 0]} // Arredondamento apenas no topo
                    barSize={categories.length > 1 ? 20 : 40} // Ajusta largura se for único ou múltiplo
                  />
                ))}
                  </RechartsBarChart>
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
