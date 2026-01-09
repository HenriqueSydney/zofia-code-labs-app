"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function TechnicalDebtBarChart({ data }: { data: any[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Débito Técnico</CardTitle>
        <CardDescription>
          Horas estimadas para correção ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
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
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderRadius: "8px",
                  borderColor: "hsl(var(--border))",
                }}
                formatter={(value) => [`${value} horas`, "Dívida Técnica"]}
              />
              <Bar
                dataKey="technicalDebt"
                fill="#a855f7"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
