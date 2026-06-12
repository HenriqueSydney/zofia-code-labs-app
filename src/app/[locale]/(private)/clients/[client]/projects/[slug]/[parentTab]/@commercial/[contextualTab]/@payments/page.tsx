import { listInvoicesAction } from "@/actions/financial/listInvoicesAction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ValidationError } from "@/errors";
import { operationWrapper } from "@/lib/operationWrapper";
import { getParams } from "@/utils/getParams";
import { TabsContent } from "@radix-ui/react-tabs";
import { PaymentItem } from "./_components/PaymentItem";
import { CreateInvoceForm } from "./_components/CreateInvoiceForm";
import { formatCurrency } from "@/utils/formatCurrency";
import { FinancialStatus } from "@/generated/prisma/enums";
import { Separator } from "@/components/ui/separator";
import { ArrowUpCircle, DollarSign } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { hasPermission } from "@/utils/hasPermission";
import { PERMISSIONS } from "@/constants/permissions";

interface IParams {
  params?: Promise<{ slug: string }>;
}

export default async function PaymentTab({ params }: IParams) {
  const t = await getTranslations("projects.commercial.payments");
  const tErrors = await getTranslations("projects.errors");
  const session = await auth();
  const { slug } = await getParams(params, ["slug"]);

  const canCreatePayment = hasPermission(
    session?.user,
    PERMISSIONS.INVOICE.CREATE,
  );
  const canReadPayment = hasPermission(session?.user, PERMISSIONS.INVOICE.READ);

  if (!canReadPayment) {
    return (
      <TabsContent value="payments" className="mt-6">
        <EmptyState
          title={tErrors("noPermissionTitle")}
          icon={DollarSign}
          description={tErrors("noPermissionPayment")}
        />
      </TabsContent>
    );
  }

  const [error, success] = await operationWrapper(
    "action",
    "listInvoicesAction",
    () => {
      return listInvoicesAction(slug);
    },
    {
      cache: "no-cache",
    },
  );

  if (error) {
    throw new ValidationError("Erro ao listar os pagamentos");
  }

  const payments = success.data ?? [];

  const totalPayments = payments.reduce(
    (acc, current) => {
      if (current.status === FinancialStatus.PAID) {
        return {
          totalPaid: acc.totalPaid + current.amount,
          totalProjected: acc.totalProjected + current.amount,
          totalRejected: acc.totalRejected,
        };
      }

      if (current.status === FinancialStatus.PENDING) {
        return {
          totalPaid: acc.totalPaid,
          totalProjected: acc.totalProjected + current.amount,
          totalRejected: acc.totalRejected,
        };
      }

      return {
        totalPaid: acc.totalPaid,
        totalProjected: acc.totalProjected,
        totalRejected: acc.totalRejected + current.amount,
      };
    },
    { totalPaid: 0, totalProjected: 0, totalRejected: 0 },
  );

  return (
    <TabsContent value="payments" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Histórico de Pagamentos</CardTitle>
          {canCreatePayment && <CreateInvoceForm projectSlug={slug} />}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payments.length === 0 ? (
              <EmptyState
                title={t("emptyTitle")}
                description={t("emptyDescription")}
                icon={DollarSign}
                action={
                  canCreatePayment ? (
                    <CreateInvoceForm projectSlug={slug} />
                  ) : undefined
                }
              />
            ) : (
              payments.map((payment) => (
                <PaymentItem
                  key={payment.id}
                  payment={payment}
                  projectSlug={slug}
                  canCreatePayment={canCreatePayment}
                />
              ))
            )}
          </div>

          {payments.length > 0 && (
            <div className="mt-6 flex justify-end ">
              <div className="bg-muted/30 rounded-xl border p-6 w-full sm:w-[500px] space-y-4">
                {/* Linha da Entrada */}
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                      Valor Projetado
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      Soma de pagos + pendentes
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-yellow-500">
                    {formatCurrency(totalPayments.totalProjected)}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                      Valor Cancelado/Vencido
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-red-500">
                    {formatCurrency(totalPayments.totalRejected)}
                  </span>
                </div>

                <Separator className="bg-border/50" />

                {/* Linha do Total */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-tight text-green-500">
                      Total de Receitas
                    </span>
                    <ArrowUpCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-green-500 tracking-tighter">
                      {formatCurrency(Number(totalPayments.totalPaid))}
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
