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

export async function PendingSettlements() {
  const { data } = await getPendingSettlementsAction();

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamentos Pendentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
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
                    {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                  </div>
                </TableCell>
                <TableCell>
                  {payment.daysOverdue > 0 ? (
                    <Badge variant="destructive">
                      {payment.daysOverdue} dias atrasado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">No prazo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    Enviar Lembrete
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
                  Nenhum pagamento pendente.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
