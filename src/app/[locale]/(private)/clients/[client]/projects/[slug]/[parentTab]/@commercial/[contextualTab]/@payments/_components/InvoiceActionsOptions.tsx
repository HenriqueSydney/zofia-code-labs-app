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
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { date } from "@/lib/dayjs";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";

interface IInvoiceActionsOptions {
  projectSlug: string;
  invoice: InvoiceWithDetails;
}

export function InvoiceActionsOptions({
  projectSlug,
  invoice,
}: IInvoiceActionsOptions) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());

  async function handleDelete(id: string) {
    const result = await deleteInvoiceAction(id, projectSlug);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Pagamento excluído com sucesso!");
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

    toast.success("Pagamento atualizado!");
    setIsPayModalOpen(false);
  }

  return (
    <div className="flex">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{"Editar Tipo de Integração"}</DialogTitle>
            <DialogDescription>
              Preencha os dados do tipo de integração
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4"></div>
          <InvoiceForm
            projectSlug={projectSlug}
            invoice={invoice}
            handleCloseModal={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      {/* Modal de Confirmação de Pagamento (Data de Recebimento) */}
      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Recebimento</DialogTitle>
            <DialogDescription>
              Selecione a data em que o valor caiu na conta.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <label className="text-sm font-medium">Data do Recebimento</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate
                    ? date(paymentDate).format("DD/MM/YYYY")
                    : "Selecione a data"}
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
              Cancelar
            </Button>
            <Button
              onClick={() =>
                handleUpdateStatus(FinancialStatus.PAID, paymentDate)
              }
            >
              Confirmar Pagamento
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
            <span>Marcar como Pago</span>
          </DropdownMenuItem>

          {/* Ação: Cancelar Fatura */}
          <DropdownMenuItem
            onClick={() => handleUpdateStatus(FinancialStatus.CANCELLED)}
            disabled={invoice.status === FinancialStatus.CANCELLED}
            className="text-accent focus:text-accent cursor-pointer"
          >
            <XCircle className="mr-2 h-4 w-4" />
            <span>Cancelar Fatura</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          {invoice.nfseLink && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => window.open(invoice.nfseLink!, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver Nota Fiscal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsDialogOpen(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={() => handleDelete(invoice.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
