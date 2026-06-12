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
import { InvoiceForm } from "./InvoiceForm";
import { InvoiceWithDetails } from "@/repositories/IInvoiceRepository";
import { deleteInvoiceAction } from "@/actions/financial/deleteInvoiceAction";
import { FinancialStatus } from "@/generated/prisma/enums";
import { updateInvoiceStatusAction } from "@/actions/financial/updateInvoiceStatusAction";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/twMerge";
import { Calendar } from "@/components/ui/calendar";
import { date } from "@/lib/dayjs";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

interface IInvoiceActionsOptions {
  projectSlug: string;
  invoice: InvoiceWithDetails;
}

export function InvoiceActionsOptions({
  projectSlug,
  invoice,
}: IInvoiceActionsOptions) {
  const t = useTranslations("projects.commercial.invoices.actions");
  const tCommon = useTranslations("common.actions");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());

  async function handleDelete(id: string) {
    const result = await deleteInvoiceAction(id, projectSlug);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(t("toastDeleted"));
  }

  async function handleUpdateStatus(
    status: FinancialStatus,
    customDate?: Date
  ) {
    const result = await updateInvoiceStatusAction(
      invoice.id,
      projectSlug,
      status,
      customDate
    );
    if (!result.success) {
      return toast.error(result.message);
    }

    toast.success(t("toastUpdated"));
    setIsPayModalOpen(false);
  }

  return (
    <div className="flex">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{t("editTitle")}</DialogTitle>
            <DialogDescription>{t("editDescription")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4"></div>
          <InvoiceForm
            projectSlug={projectSlug}
            invoice={invoice}
            handleCloseModal={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("confirmReceiptTitle")}</DialogTitle>
            <DialogDescription>
              {t("confirmReceiptDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <label className="text-sm font-medium">
              {t("receiptDateLabel")}
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
                  initialFocus
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
                handleUpdateStatus(FinancialStatus.PAID, paymentDate)
              }
            >
              {t("confirmPayment")}
            </Button>
          </AlertDialogFooter>
        </DialogContent>
      </Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setIsPayModalOpen(true)}
            disabled={invoice.status === FinancialStatus.PAID}
            className="text-green-600 focus:text-green-600 focus:bg-green-50 cursor-pointer"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            <span>{t("markAsPaid")}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleUpdateStatus(FinancialStatus.CANCELLED)}
            disabled={invoice.status === FinancialStatus.CANCELLED}
            className="text-accent focus:text-accent cursor-pointer"
          >
            <XCircle className="mr-2 h-4 w-4" />
            <span>{t("cancelInvoice")}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          {invoice.nfseLink && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => window.open(invoice.nfseLink!, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("viewInvoice")}
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
            onClick={() => handleDelete(invoice.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {tCommon("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
