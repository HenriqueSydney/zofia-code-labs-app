"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateProportion } from "@/utils/calculateProportion";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/utils/formatDuration";

type ReferrerData = {
  name: string; // O domínio (ex: google.com, t.co, facebook.com)
  value: number; // Visitantes únicos
  pageviews: number;
  avgTime: number;
  bounces: number;
};

interface IReferrerTable {
  referrers: ReferrerData[];
  totalPageViews: number;
}

export function ReferrerTable({ referrers, totalPageViews }: IReferrerTable) {
  const data = referrers.map((ref) => {
    // Correção da taxa de rejeição: calculada sobre pageviews para não exceder 100%
    const bounceRate =
      ref.pageviews > 0 ? calculateProportion(ref.pageviews, ref.bounces) : 0;

    return {
      domain: ref.name === "" ? "Direto / Nenhum" : ref.name,
      visitors: ref.value,
      pageViews: ref.pageviews,
      avgTime: ref.avgTime,
      bounceRate: bounceRate,
      pageViewsPercentage: calculateProportion(totalPageViews, ref.pageviews),
    };
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Fonte de Origem</TableHead>
          <TableHead className="text-right">Visualizações</TableHead>
          <TableHead className="w-[180px]">Participação</TableHead>
          <TableHead className="text-right">Visitantes</TableHead>
          <TableHead className="text-right">Permanência</TableHead>
          <TableHead className="text-right">Rejeição</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.domain}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {/* Ícone rápido para identificar a fonte (Google, LinkedIn, etc) */}
                {item.domain !== "Direto / Nenhum" && (
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${item.domain}&sz=32`}
                    alt=""
                    className="w-4 h-4 grayscale opacity-70"
                  />
                )}
                <span className="truncate max-w-[250px]" title={item.domain}>
                  {item.domain}
                </span>
              </div>
            </TableCell>

            <TableCell className="text-right font-mono">
              {item.pageViews.toLocaleString()}
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-2">
                <Progress value={item.pageViewsPercentage} className="h-2" />
                <span className="text-[10px] text-muted-foreground w-8">
                  {item.pageViewsPercentage}%
                </span>
              </div>
            </TableCell>

            <TableCell className="text-right">
              {item.visitors.toLocaleString()}
            </TableCell>

            <TableCell className="text-right text-muted-foreground">
              {formatDuration(item.avgTime)}
            </TableCell>

            <TableCell className="text-right">
              <span
                className={
                  item.bounceRate > 50
                    ? "text-orange-500 font-medium"
                    : "text-muted-foreground"
                }
              >
                {item.bounceRate}%
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
