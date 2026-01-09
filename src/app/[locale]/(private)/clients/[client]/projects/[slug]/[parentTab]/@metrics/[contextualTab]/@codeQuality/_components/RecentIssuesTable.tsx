"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RecentIssue } from "@/services/codeQuality/ICodeQualityService";

export function RecentIssuesTable({ issues }: { issues: RecentIssue[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Severidade</TableHead>
          <TableHead>Arquivo</TableHead>
          <TableHead>Mensagem</TableHead>
          <TableHead>Criado em</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {issues.map((issue) => (
          <TableRow key={issue.id}>
            <TableCell>
              <Badge variant="outline" className="text-[10px]">
                {issue.type}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  issue.severity === "BLOCKER" || issue.severity === "CRITICAL"
                    ? "destructive"
                    : "secondary"
                }
                className="text-[10px]"
              >
                {issue.severity}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[150px] truncate font-mono text-xs">
              {issue.file}
              {issue.line ? `:${issue.line}` : ""}
            </TableCell>
            <TableCell className="max-w-[250px] truncate text-sm">
              {issue.message}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {issue.created}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
