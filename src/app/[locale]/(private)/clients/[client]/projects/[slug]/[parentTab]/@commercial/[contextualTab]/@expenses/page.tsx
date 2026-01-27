import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppError } from "@/errors/AppError";
import { operationWrapper } from "@/lib/operationWrapper";
import { getParams } from "@/utils/getParams";
import { TabsContent } from "@radix-ui/react-tabs";
import { ExpenseItem } from "./_components/ExpenseItem";
import { CreateExpenseForm } from "./_components/CreateExpenseForm";
import { formatCurrency } from "@/utils/formatCurrency";
import { ExpenseStatus } from "@/generated/prisma/enums";
import { Separator } from "@/components/ui/separator";
import { ArrowDownCircle, BanknoteX, Wallet } from "lucide-react";
import { listExpensesAction } from "@/actions/expenses/listExpenseAction";
import { EmptyState } from "@/components/EmptyState";

interface IParams {
  params?: Promise<{ slug: string }>;
}

export default async function ExpenseTab({ params }: IParams) {
  const { slug } = await getParams(params, ["slug"]);

  // Chama a server action de listar despesas
  const [error, success] = await operationWrapper(
    "action",
    "listExpensesAction",
    () => {
      return listExpensesAction(slug);
    },
    {
      cache: "no-cache", // Garante dados frescos ao adicionar nova despesa
    },
  );

  if (error) {
    throw new AppError("Erro ao listar as despesas");
  }

  const expenses = success.data?.expenses ?? [];

  // Cálculo dos totais
  const summary = expenses.reduce(
    (acc, current) => {
      // Se está PAGO: Soma no total pago e no projetado (pois já foi realizado)
      if (current.status === ExpenseStatus.PAID) {
        return {
          totalPaid: acc.totalPaid + Number(current.amount),
          totalProjected: acc.totalProjected + Number(current.amount),
          totalCanceled: acc.totalCanceled,
        };
      }

      // Se está PENDENTE ou AGENDADO: Soma apenas no projetado (dívida futura)
      if (
        current.status === ExpenseStatus.PENDING ||
        current.status === ExpenseStatus.SCHEDULED
      ) {
        return {
          totalPaid: acc.totalPaid,
          totalProjected: acc.totalProjected + Number(current.amount),
          totalCanceled: acc.totalCanceled,
        };
      }

      // Se está CANCELADO: Soma apenas no cancelado (para estatística)
      if (current.status === ExpenseStatus.CANCELED) {
        return {
          totalPaid: acc.totalPaid,
          totalProjected: acc.totalProjected,
          totalCanceled: acc.totalCanceled + Number(current.amount),
        };
      }

      return acc;
    },
    { totalPaid: 0, totalProjected: 0, totalCanceled: 0 },
  );

  return (
    <TabsContent value="expenses" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Contas a Pagar & Despesas</CardTitle>
          </div>
          <CreateExpenseForm projectSlug={slug} />
        </CardHeader>
        <CardContent>
          {/* Lista de Despesas */}
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <EmptyState
                title="Nenhuma despesa "
                description="Nenhum despesa registrada até o momento. Registre um pagamento ou aguarde o projeto chegar na fase de pagamento."
                icon={BanknoteX}
                action={<CreateExpenseForm projectSlug={slug} />}
              />
            ) : (
              expenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  projectSlug={slug}
                />
              ))
            )}
          </div>

          {/* Card de Resumo Financeiro (Rodapé) */}
          {expenses.length > 0 && (
            <div className="mt-8 flex justify-end">
              <div className="bg-muted/30 rounded-xl border p-6 w-full sm:w-[500px] space-y-4">
                {/* Valor Projetado (Passivo Total) */}
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                      Valor Projetado (Passivo)
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      Soma de pagos + pendentes
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-yellow-600 dark:text-yellow-500">
                    {formatCurrency(summary.totalProjected)}
                  </span>
                </div>

                {/* Valor Cancelado */}
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                      Cancelados
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-muted-foreground">
                    {formatCurrency(summary.totalCanceled)}
                  </span>
                </div>

                <Separator className="bg-border/50" />

                {/* Total Pago (Saída Real) */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-tight text-red-600 dark:text-red-400">
                      Total Pago (Saídas)
                    </span>
                    <ArrowDownCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-red-600 dark:text-red-400 tracking-tighter">
                      {formatCurrency(summary.totalPaid)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
