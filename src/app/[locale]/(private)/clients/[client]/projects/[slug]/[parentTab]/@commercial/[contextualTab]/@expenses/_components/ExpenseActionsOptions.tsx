"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  CheckCircle2,
  Edit,
  ExternalLink,
  MoreVertical,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/twMerge";
import { Calendar } from "@/components/ui/calendar";
import { date } from "@/lib/dayjs";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";

import { ExpenseForm } from "./ExpenseForm";
import { ExpenseStatus } from "@/generated/prisma/enums";
import { deleteExpenseAction } from "@/actions/expenses/deleteExpenseAction";
import { updateExpenseStatusAction } from "@/actions/expenses/updateExpenseStatusAction";
import { useTranslations } from "next-intl";

interface IExpenseActionsOptions {
  projectSlug: string;
  expense: any;
}

export function ExpenseActionsOptions({
  projectSlug,
  expense,
}: IExpenseActionsOptions) {
  const t = useTranslations("projects.commercial.expenses");
  const tActions = useTranslations("projects.commercial.expenses.actions");
  const tCommon = useTranslations("common.actions");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());

  async function handleDelete(id: string) {
    const result = await deleteExpenseAction(id, projectSlug);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(t("toastDeleted"));
  }

  async function handleUpdateStatus(status: ExpenseStatus, customDate?: Date) {
    const result = await updateExpenseStatusAction(
      expense.id,
      projectSlug,
      status,
      customDate
    );
    if (!result.success) {
      return toast.error(result.message);
    }

    toast.success(t("toastStatusUpdated"));
    setIsPayModalOpen(false);
  }

  return (
    <div className="flex">
      {/* Modal de Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{tActions("editTitle")}</DialogTitle>
            <DialogDescription>{tActions("editDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4"></div>
          <ExpenseForm
            projectSlug={projectSlug}
            expense={expense}
            handleCloseModal={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Pagamento (Baixa) */}
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{tActions("confirmPaymentTitle")}</DialogTitle>
            <DialogDescription>
              {tActions("confirmPaymentDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <label className="text-sm font-medium">
              {tActions("paymentDateLabel")}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate
                    ? date(paymentDate).format("DD/MM/YYYY")
                    : tCommon("selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={setPaymentDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => setIsPayModalOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={() =>
                handleUpdateStatus(ExpenseStatus.PAID, paymentDate)
              }
              variant="destructive"
            >
              {tActions("confirmWriteOff")}
            </Button>
          </AlertDialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dropdown de Ações */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setIsPayModalOpen(true)}
            disabled={expense.status === ExpenseStatus.PAID}
            className="text-green-600 focus:text-green-600 focus:bg-green-50 cursor-pointer"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            <span>{tActions("markAsPaid")}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleUpdateStatus(ExpenseStatus.CANCELED)}
            disabled={expense.status === ExpenseStatus.CANCELED}
            className="text-orange-600 focus:text-orange-600 focus:bg-orange-50 cursor-pointer"
          >
            <XCircle className="mr-2 h-4 w-4" />
            <span>{tActions("cancelExpense")}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Verifica se existe link de comprovante (receiptLink) */}
          {expense.receiptLink && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => window.open(expense.receiptLink!, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {tActions("viewReceipt")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            {tCommon("edit")}
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={() => handleDelete(expense.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {tCommon("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
