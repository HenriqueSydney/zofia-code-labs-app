"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { QualityGateCondition } from "@/services/codeQuality/ICodeQualityService";
import { useTranslations } from "next-intl";

export function QualityGateTable({
  conditions,
}: {
  conditions: QualityGateCondition[];
}) {
  const t = useTranslations("projects.metrics.codeQuality.qualityGate");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OK":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "WARN":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "ERROR":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("metric")}</TableHead>
          <TableHead>{t("currentValue")}</TableHead>
          <TableHead>{t("threshold")}</TableHead>
          <TableHead>{t("status")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {conditions.map((c) => (
          <TableRow key={c.metric}>
            <TableCell className="font-medium capitalize">{c.metric}</TableCell>
            <TableCell>{c.value}</TableCell>
            <TableCell className="text-muted-foreground">
              {c.threshold}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {getStatusIcon(c.status)}
                <span className="text-xs font-semibold">{c.status}</span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
