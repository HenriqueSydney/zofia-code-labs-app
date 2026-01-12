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
import { formatDuration } from "@/utils/formatDuration"; // Certifique-se de criar este utilitário

type PageData = {
  name: string; // O path (ex: /pt/ferramentas-pdf/)
  value: number; // Visitantes
  pageviews: number;
  avgTime: number;
  bounces: number;
};

interface IPagesTable {
  pages: PageData[];
  totalPageViews: number;
}

export function PagesTable({ pages, totalPageViews }: IPagesTable) {
  const data = pages.map((page) => {
    // Cálculo da Taxa de Rejeição local por página
    const bounceRate =
      page.pageviews > 0
        ? calculateProportion(page.pageviews, page.bounces)
        : 0;

    return {
      path: page.name,
      visitors: page.value,
      pageViews: page.pageviews,
      avgTime: page.avgTime,
      bounceRate: bounceRate,
      pageViewsPercentage: calculateProportion(totalPageViews, page.pageviews),
    };
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">URL da Página</TableHead>
          <TableHead className="text-right">Visualizações</TableHead>
          <TableHead className="w-[200px]">Proporção</TableHead>
          <TableHead className="text-right">Visitantes</TableHead>
          <TableHead className="text-right">Tempo Médio</TableHead>
          <TableHead className="text-right">Rejeição</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.path}>
            <TableCell
              className="font-medium truncate max-w-[300px]"
              title={item.path}
            >
              {item.path}
            </TableCell>

            <TableCell className="text-right">
              {item.pageViews.toLocaleString()}
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-2">
                <Progress value={item.pageViewsPercentage} className="h-2" />
                <span className="text-xs text-muted-foreground min-w-[35px]">
                  {item.pageViewsPercentage}%
                </span>
              </div>
            </TableCell>

            <TableCell className="text-right">
              {item.visitors.toLocaleString()}
            </TableCell>

            <TableCell className="text-right whitespace-nowrap">
              {formatDuration(item.avgTime)}
            </TableCell>

            <TableCell className="text-right">
              <span className={item.bounceRate > 50 ? "text-orange-500" : ""}>
                {item.bounceRate}%
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
