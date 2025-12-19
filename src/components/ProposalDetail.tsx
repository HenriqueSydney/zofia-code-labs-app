import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, User, CheckCircle2 } from "lucide-react";
import { date } from "@/lib/dayjs";
import { formatCurrency } from "@/utils/formatCurrency";

interface IProposalDetails {
  proposal: ProposalWithDetails;
}

export function ProposalDetails({ proposal }: IProposalDetails) {
  console.log(proposal);
  return (
    <>
      <ScrollArea className="flex-1 pr-4">
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Informações Gerais */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium leading-none text-muted-foreground">
              Detalhes da Emissão
            </h4>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 opacity-70" />
              <span className="font-semibold">Criado por:</span>{" "}
              {proposal.createdUser?.name}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 opacity-70" />
              <span className="font-semibold">Emitida em:</span>{" "}
              {date(proposal.createdAt).format("DD/MM/YYYY HH:mm")}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium leading-none text-muted-foreground">
              Validade e Aprovação
            </h4>
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-orange-500" />
              <span className="font-semibold">Válida até:</span>{" "}
              {date(proposal.validUntil).format("DD/MM/YYYY")}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 opacity-70" />
              <span className="font-semibold">Status Atual:</span>
              <span className="text-primary font-medium">
                {proposal.isCurrent ? "Versão Ativa" : "Histórico"}
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Tabela de Itens/Serviços */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Serviços Incluídos
          </h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[400px]">Serviço</TableHead>
                  <TableHead className="text-right">Preço Base</TableHead>
                  <TableHead className="text-right">Desconto</TableHead>
                  <TableHead className="text-right">Preço Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposal.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.serviceType.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {item.discount > 0 ? `-${item.discount}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.finalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </ScrollArea>

      {/* Rodapé com Totalização */}
      <div className="mt-6 flex justify-end">
        <div className="bg-primary/5 rounded-lg p-4 w-full sm:w-[300px] border border-primary/10">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">
              Valor Total da Proposta
            </span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(Number(proposal.totalValue))}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
