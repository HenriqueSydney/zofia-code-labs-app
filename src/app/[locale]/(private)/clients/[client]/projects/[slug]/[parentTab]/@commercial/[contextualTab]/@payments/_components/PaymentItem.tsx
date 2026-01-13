import { Banknote, Calendar, DollarSign, FileText } from "lucide-react";
import { date } from "@/lib/dayjs";
import { FinancialStatus } from "@/generated/prisma/enums";
import { InvoiceWithDetails } from "@/repositories/IInvoiceRepository";
import { formatCurrency } from "@/utils/formatCurrency";
import { InvoiceActionsOptions } from "./InvoiceActionsOptions";

interface PaymentItemProps {
  projectSlug: string;
  payment: InvoiceWithDetails;
}

export function PaymentItem({ payment, projectSlug }: PaymentItemProps) {
  // Mapeamento de cores e estilos baseado no FinancialStatus do Prisma
  const statusConfig: Record<
    FinancialStatus,
    { container: string; icon: string; label: string }
  > = {
    [FinancialStatus.PAID]: {
      container: "bg-green-500/10",
      icon: "text-green-500",
      label: "Pago",
    },
    [FinancialStatus.OVERDUE]: {
      container: "bg-red-500/10",
      icon: "text-red-500",
      label: "Atrasado",
    },
    [FinancialStatus.PENDING]: {
      container: "bg-yellow-500/10",
      icon: "text-yellow-500",
      label: "Pendente",
    },
    [FinancialStatus.CANCELLED]: {
      container: "bg-muted",
      icon: "text-muted-foreground",
      label: "Cancelado",
    },
  };

  const currentStatus = statusConfig[payment.status as FinancialStatus];

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg transition-colors">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${currentStatus.container}`}>
          <DollarSign className={`h-5 w-5 ${currentStatus.icon}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{payment.description}</p>
            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-border bg-background font-bold text-muted-foreground">
              {payment.paymentType}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              Vencimento: {date(payment.dueDate).format("DD/MM/YYYY")}
            </span>
            {payment.paidAt && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Banknote className="h-3 w-3" />
                  <span>
                    Pagamento: {date(payment.paidAt).format("DD/MM/YYYY")}
                  </span>
                </div>
              </>
            )}
            {payment.nfseNumber && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>NF: {payment.nfseNumber}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="font-semibold text-lg">
            {formatCurrency(Number(payment.amount))}
          </p>
          <p className="text-xs text-muted-foreground">
            {payment.client.tradeName || payment.client.companyName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge de Status Simples */}
          <span
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${currentStatus.container} ${currentStatus.icon}`}
          >
            {currentStatus.label}
          </span>

          {/* Menu de Ações */}
          <InvoiceActionsOptions projectSlug={projectSlug} invoice={payment} />
        </div>
      </div>
    </div>
  );
}
