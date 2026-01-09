"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SEVERITY_COLORS: Record<string, string> = {
  Blocker: "hsl(var(--destructive))",
  Critical: "#ea580c",
  Major: "#f59e0b",
  Minor: "#eab308",
  Info: "#3b82f6",
};

export function SeverityDonutChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Issues por Severidade</CardTitle>
        <CardDescription>Distribuição atual de problemas</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {/* O segredo está aqui: definir uma altura fixa na div pai */}
        <div className="h-[250px] w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--accent))",
                  borderRadius: "8px",
                  borderColor: "hsl(var(--border))",
                  fontSize: "12px",
                }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={{ strokeWidth: 1 }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={SEVERITY_COLORS[entry.name] || "#8884d8"}
                    stroke="none"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
