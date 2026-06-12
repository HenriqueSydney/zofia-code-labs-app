import { Banknote, Calendar, DollarSign, FileText } from "lucide-react";
import { date } from "@/lib/dayjs";
import { FinancialStatus } from "@/generated/prisma/enums";
import { InvoiceWithDetails } from "@/repositories/IInvoiceRepository";
import { formatCurrency } from "@/utils/formatCurrency";
import { InvoiceActionsOptions } from "./InvoiceActionsOptions";
import { getTranslations } from "next-intl/server";

interface PaymentItemProps {
  projectSlug: string;
  payment: InvoiceWithDetails;
  canCreatePayment: boolean;
}

const INVOICE_STATUS_KEYS: Record<FinancialStatus, string> = {
  [FinancialStatus.PAID]: "PAID",
  [FinancialStatus.OVERDUE]: "OVERDUE",
  [FinancialStatus.PENDING]: "PENDING",
  [FinancialStatus.CANCELLED]: "CANCELLED",
  [FinancialStatus.DRAFT]: "DRAFT",
};

export async function PaymentItem({
  payment,
  projectSlug,
  canCreatePayment,
}: PaymentItemProps) {
  const t = await getTranslations("projects.commercial.payments");
  const tStatus = await getTranslations("projects.commercial.payments.status");

  const statusConfig: Record<
    FinancialStatus,
    { container: string; icon: string }
  > = {
    [FinancialStatus.PAID]: {
      container: "bg-green-500/10",
      icon: "text-green-500",
    },
    [FinancialStatus.OVERDUE]: {
      container: "bg-red-500/10",
      icon: "text-red-500",
    },
    [FinancialStatus.PENDING]: {
      container: "bg-yellow-500/10",
      icon: "text-yellow-500",
    },
    [FinancialStatus.CANCELLED]: {
      container: "bg-muted",
      icon: "text-muted-foreground",
    },
    [FinancialStatus.DRAFT]: {
      container: "bg-gray-100",
      icon: "text-gray-500",
    },
  };

  const status = payment.status as FinancialStatus;
  const currentStatus = statusConfig[status];
  const statusLabel = tStatus(INVOICE_STATUS_KEYS[status] as never);

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
              {t("item.dueDate")}: {date(payment.dueDate).format("DD/MM/YYYY")}
            </span>
            {payment.paidAt && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Banknote className="h-3 w-3" />
                  <span>
                    {t("item.paymentDate")}:{" "}
                    {date(payment.paidAt).format("DD/MM/YYYY")}
                  </span>
                </div>
              </>
            )}
            {payment.nfseNumber && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>
                    {t("item.nf")}: {payment.nfseNumber}
                  </span>
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
          <span
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${currentStatus.container} ${currentStatus.icon}`}
          >
            {statusLabel}
          </span>

          {canCreatePayment && (
            <InvoiceActionsOptions
              projectSlug={projectSlug}
              invoice={payment}
            />
          )}
        </div>
      </div>
    </div>
  );
}
