"use client";

import { Banknote, Calendar, FileText, Wallet } from "lucide-react";
import { date } from "@/lib/dayjs";
import { ExpenseStatus } from "@/generated/prisma/enums";
import { formatCurrency } from "@/utils/formatCurrency";
import { ExpenseActionsOptions } from "./ExpenseActionsOptions";
import { useTranslations } from "next-intl";

interface ExpenseItemProps {
  projectSlug: string;
  expense: any;
  canCreateExpense: boolean;
}

const EXPENSE_STATUS_KEYS: Record<ExpenseStatus, string> = {
  [ExpenseStatus.PAID]: "PAID",
  [ExpenseStatus.SCHEDULED]: "SCHEDULED",
  [ExpenseStatus.PENDING]: "PENDING",
  [ExpenseStatus.CANCELED]: "CANCELED",
};

export function ExpenseItem({
  expense,
  projectSlug,
  canCreateExpense,
}: ExpenseItemProps) {
  const t = useTranslations("projects.commercial.expenses");
  const tStatus = useTranslations("projects.commercial.expenses.status");

  const statusConfig: Record<
    ExpenseStatus,
    { container: string; icon: string }
  > = {
    [ExpenseStatus.PAID]: {
      container: "bg-green-500/10",
      icon: "text-green-500",
    },
    [ExpenseStatus.SCHEDULED]: {
      container: "bg-blue-500/10",
      icon: "text-blue-500",
    },
    [ExpenseStatus.PENDING]: {
      container: "bg-yellow-500/10",
      icon: "text-yellow-500",
    },
    [ExpenseStatus.CANCELED]: {
      container: "bg-muted",
      icon: "text-muted-foreground",
    },
  };

  const status = expense.status as ExpenseStatus;
  const currentStatus = statusConfig[status] || {
    container: "bg-gray-100",
    icon: "text-gray-500",
  };
  const statusLabel = EXPENSE_STATUS_KEYS[status]
    ? tStatus(EXPENSE_STATUS_KEYS[status] as never)
    : expense.status;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${currentStatus.container}`}>
          <Wallet className={`h-5 w-5 ${currentStatus.icon}`} />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{expense.description}</p>
            {expense.paymentType && (
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-border bg-background font-bold text-muted-foreground">
                {expense.paymentType.replace("_", " ")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Calendar className="h-3 w-3" />
            <span>
              {t("item.dueDate")}: {date(expense.dueDate).format("DD/MM/YYYY")}
            </span>

            {expense.paidAt && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1 text-green-600/80">
                  <Banknote className="h-3 w-3" />
                  <span>
                    {t("item.paidAt")}:{" "}
                    {date(expense.paidAt).format("DD/MM/YYYY")}
                  </span>
                </div>
              </>
            )}

            {expense.invoiceNumber && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>
                    {t("item.invoice")}: {expense.invoiceNumber}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="font-semibold text-lg text-red-600/90">
            - {formatCurrency(Number(expense.amount))}
          </p>

          <p className="text-xs text-muted-foreground">
            {expense.supplier
              ? expense.supplier
              : expense.expenseCategory?.name || t("item.noSupplier")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${currentStatus.container} ${currentStatus.icon}`}
          >
            {statusLabel}
          </span>

          {canCreateExpense && (
            <ExpenseActionsOptions
              projectSlug={projectSlug}
              expense={expense}
            />
          )}
        </div>
      </div>
    </div>
  );
}
