import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { date } from "@/lib/dayjs";
import { getPaymentStatusBadge } from "@/mappers/paymentStatusBadge";
import { formatCurrency } from "@/utils/formatCurrency";
import { TabsContent } from "@radix-ui/react-tabs";
import { Calendar, DollarSign, Plus } from "lucide-react";

const mockPayments: any[] = [
  {
    id: "1",
    description: "Entrada (30%)",
    value: 15600,
    type: "entry",
    status: "paid",
    dueDate: "2024-01-25",
    paidAt: "2024-01-24",
    invoiceNumber: "NF-2024-001",
  },
  {
    id: "2",
    description: "Marco 1 - Entrega MVP (30%)",
    value: 15600,
    type: "milestone",
    status: "paid",
    dueDate: "2024-02-28",
    paidAt: "2024-02-27",
    invoiceNumber: "NF-2024-015",
  },
  {
    id: "3",
    description: "Marco 2 - Entrega Final (40%)",
    value: 20800,
    type: "final",
    status: "pending",
    dueDate: "2024-03-30",
  },
];

export default function PaymentTab() {
  return (
    <TabsContent value="payments" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Histórico de Pagamentos</CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Pagamento
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      payment.status === "paid"
                        ? "bg-green-500/10"
                        : payment.status === "overdue"
                        ? "bg-red-500/10"
                        : "bg-muted"
                    }`}
                  >
                    <DollarSign
                      className={`h-5 w-5 ${
                        payment.status === "paid"
                          ? "text-green-500"
                          : payment.status === "overdue"
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Vencimento: {date(payment.dueDate).format("DD/MM/YYYY")}
                      </span>
                      {payment.invoiceNumber && (
                        <>
                          <span>•</span>
                          <span>{payment.invoiceNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(payment.value)}
                    </p>
                    {payment.paidAt && (
                      <p className="text-xs text-muted-foreground">
                        Pago em{" "}
                        {date(payment.paidAt).format("DD/MM/YYYY HH:mm")}
                      </p>
                    )}
                  </div>
                  {getPaymentStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
