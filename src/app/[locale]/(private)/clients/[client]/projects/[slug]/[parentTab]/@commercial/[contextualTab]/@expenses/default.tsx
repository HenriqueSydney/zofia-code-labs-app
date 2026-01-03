import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { date } from "@/lib/dayjs";
import { formatCurrency } from "@/utils/formatCurrency";
import { TabsContent } from "@radix-ui/react-tabs";
import { Calendar, Download, Plus, Receipt, User } from "lucide-react";

const mockExpenses: any[] = [
  {
    id: "1",
    description: "Licença Adobe XD",
    category: "Software",
    value: 250,
    date: "2024-01-20",
    registeredBy: "Ana Silva",
    receipt: "receipt-001.pdf",
  },
  {
    id: "2",
    description: "Hospedagem AWS (Jan)",
    category: "Infraestrutura",
    value: 180,
    date: "2024-01-31",
    registeredBy: "Carlos Mendes",
    receipt: "receipt-002.pdf",
  },
  {
    id: "3",
    description: "Domínio cliente.com.br",
    category: "Infraestrutura",
    value: 45,
    date: "2024-02-01",
    registeredBy: "Ana Silva",
    receipt: "receipt-003.pdf",
  },
];

export default function ExpensesTab() {
  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.value, 0);
  return (
    <TabsContent value="expenses" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Despesas do Projeto</CardTitle>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Despesa
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Receipt className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {expense.category}
                      </Badge>
                      <span>•</span>
                      <Calendar className="h-3 w-3" />
                      <span>{date(expense.date).format("DD/MM/YYYY")}</span>
                      <span>•</span>
                      <User className="h-3 w-3" />
                      <span>{expense.registeredBy}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-red-600">
                    -{formatCurrency(expense.value)}
                  </p>
                  {expense.receipt && (
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="font-medium">Total de Despesas</span>
            <span className="text-lg font-bold text-red-600">
              -{formatCurrency(totalExpenses)}
            </span>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
