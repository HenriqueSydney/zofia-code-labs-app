import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calendar } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { getPendingSettlementsAction } from "@/actions/stats/getPendingSettlementsAction";
import { getLocale, getTranslations } from "next-intl/server";

export async function PendingSettlements() {
  const t = await getTranslations("financial.pendingSettlements");
  const locale = await getLocale();
  const { data } = await getPendingSettlementsAction();

  if (!data) return null;

  const dateFormatter = new Intl.DateTimeFormat(locale);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("columns.client")}</TableHead>
              <TableHead>{t("columns.project")}</TableHead>
              <TableHead className="text-right">{t("columns.amount")}</TableHead>
              <TableHead>{t("columns.dueDate")}</TableHead>
              <TableHead>{t("columns.status")}</TableHead>
              <TableHead className="text-right">{t("columns.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    {payment.clientName}
                  </div>
                </TableCell>
                <TableCell>{payment.projectName}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {dateFormatter.format(new Date(payment.dueDate))}
                  </div>
                </TableCell>
                <TableCell>
                  {payment.daysOverdue > 0 ? (
                    <Badge variant="destructive">
                      {t("status.overdueDays", {
                        count: payment.daysOverdue,
                      })}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{t("status.onTime")}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    {t("sendReminder")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  {t("empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
