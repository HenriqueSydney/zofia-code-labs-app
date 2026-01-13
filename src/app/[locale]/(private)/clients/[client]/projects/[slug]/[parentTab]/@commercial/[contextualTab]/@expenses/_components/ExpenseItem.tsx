"use client";

import { Banknote, Calendar, FileText, Wallet } from "lucide-react";
import { date } from "@/lib/dayjs";
import { ExpenseStatus } from "@/generated/prisma/enums"; // Ajustado para ExpenseStatus
import { formatCurrency } from "@/utils/formatCurrency";
import { ExpenseActionsOptions } from "./ExpenseActionsOptions";

// Se você não tiver um tipo ExpenseWithDetails exportado, pode definir uma interface parcial aqui
// ou usar 'any' temporariamente. O ideal é vir do seu repositório.
interface ExpenseItemProps {
  projectSlug: string;
  expense: any; // Substitua por ExpenseWithDetails se tiver a tipagem gerada
}

export function ExpenseItem({ expense, projectSlug }: ExpenseItemProps) {
  // Mapeamento baseado no ExpenseStatus (conforme seu Zod anterior: PENDING, PAID, CANCELED, SCHEDULED)
  const statusConfig: Record<
    ExpenseStatus,
    { container: string; icon: string; label: string }
  > = {
    [ExpenseStatus.PAID]: {
      container: "bg-green-500/10",
      icon: "text-green-500",
      label: "Pago",
    },
    // Adicionei SCHEDULED pois estava no seu schema Zod
    [ExpenseStatus.SCHEDULED]: {
      container: "bg-blue-500/10",
      icon: "text-blue-500",
      label: "Agendado",
    },
    [ExpenseStatus.PENDING]: {
      container: "bg-yellow-500/10",
      icon: "text-yellow-500",
      label: "Pendente",
    },
    [ExpenseStatus.CANCELED]: {
      // Verifique se no Prisma é CANCELED ou CANCELLED
      container: "bg-muted",
      icon: "text-muted-foreground",
      label: "Cancelado",
    },
  };

  // Fallback seguro caso venha um status não mapeado
  const currentStatus = statusConfig[expense.status as ExpenseStatus] || {
    container: "bg-gray-100",
    icon: "text-gray-500",
    label: expense.status,
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-4">
        {/* Ícone Wallet indica saída/carteira */}
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
              Vencimento: {date(expense.dueDate).format("DD/MM/YYYY")}
            </span>

            {expense.paidAt && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1 text-green-600/80">
                  <Banknote className="h-3 w-3" />
                  <span>Pago: {date(expense.paidAt).format("DD/MM/YYYY")}</span>
                </div>
              </>
            )}

            {/* Ajustado para invoiceNumber (número da nota do fornecedor) */}
            {expense.invoiceNumber && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>Nota: {expense.invoiceNumber}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          {/* Valor da despesa */}
          <p className="font-semibold text-lg text-red-600/90">
            - {formatCurrency(Number(expense.amount))}
          </p>

          {/* Mostra o fornecedor se existir. Se não, mostra a categoria (opcional) */}
          <p className="text-xs text-muted-foreground">
            {expense.supplier
              ? expense.supplier
              : expense.expenseCategory?.name || "Sem fornecedor"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge de Status */}
          <span
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${currentStatus.container} ${currentStatus.icon}`}
          >
            {currentStatus.label}
          </span>

          {/* Menu de Ações Específico de Expense */}
          <ExpenseActionsOptions projectSlug={projectSlug} expense={expense} />
        </div>
      </div>
    </div>
  );
}
