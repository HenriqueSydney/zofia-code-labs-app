"use client";

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
  Bar,
  CartesianGrid,
  Legend,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface IVisitorsBarChart {
  hourlyHistory: UmamiHistoryResponse;
}

export function VisitorsBarChart({ hourlyHistory }: IVisitorsBarChart) {
  const fullDaySkeleton = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0") + "h";
    return { hour, visitors: 0 };
  });

  // 2. Mapear os dados reais do Umami para um formato de fácil consulta (Lookup)
  const realDataMap = new Map(
    hourlyHistory.sessions.map((session) => [
      date(session.x).format("HH[h]"), // Garantimos o match no formato "HH:00"
      session.y,
    ])
  );

  // 3. Mesclar o esqueleto com os dados reais
  const hourlyData = fullDaySkeleton.map((slot) => ({
    ...slot,
    visitors: realDataMap.get(slot.hour) || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitantes por Hora</CardTitle>
        <CardDescription>Distribuição ao longo do dia</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hourlyData}
              margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--muted-foreground) / 0.2)"
              />
              <XAxis
                dataKey="hour"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                interval={3} // Mostra as labels de 3 em 3 horas para não poluir
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
              />
              <Bar
                dataKey="visitors"
                fill="#a855f7" // Cor roxa do seu layout de referência
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
