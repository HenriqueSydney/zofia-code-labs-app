"use client";

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
import { useTranslations } from "next-intl";

interface IProposalDetails {
  proposal: ProposalWithDetails;
}

export function ProposalDetails({ proposal }: IProposalDetails) {
  const t = useTranslations("proposals.detail");

  return (
    <>
      <ScrollArea className="flex-1 pr-4">
        <div className="min-h-30 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium leading-none text-muted-foreground">
                {t("title")}
              </h4>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 opacity-70" />
                <span className="font-semibold">{t("createdBy")}</span>{" "}
                {proposal.createdUser?.name}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 opacity-70" />
                <span className="font-semibold">{t("issuedAt")}</span>{" "}
                {date(proposal.createdAt).format("DD/MM/YYYY HH:mm")}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium leading-none text-muted-foreground">
                {t("validitySection")}
              </h4>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-orange-500" />
                <span className="font-semibold">{t("validUntil")}</span>{" "}
                {date(proposal.validUntil).format("DD/MM/YYYY")}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 opacity-70" />
                <span className="font-semibold">{t("currentStatus")}</span>
                <span className="text-primary font-medium">
                  {proposal.isCurrent ? t("activeVersion") : t("history")}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {t("includedServices")}
          </h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[400px]">{t("service")}</TableHead>
                  <TableHead className="text-right">{t("basePrice")}</TableHead>
                  <TableHead className="text-right">{t("discount")}</TableHead>
                  <TableHead className="text-right">
                    {t("finalPrice")}
                  </TableHead>
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

      <div className="mt-6 flex justify-end pr-4">
        <div className="bg-muted/30 rounded-xl border p-6 w-full sm:w-[350px] space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                {t("downPayment")}
              </span>
              <p className="text-xs text-muted-foreground/80">
                {t("downPaymentPercent", {
                  percent: Number(proposal.downPaymentPercentage),
                })}
              </p>
            </div>
            <span className="text-lg font-semibold text-foreground">
              {formatCurrency(
                (Number(proposal.totalValue) *
                  Number(proposal.downPaymentPercentage)) /
                  100,
              )}
            </span>
          </div>
          <Separator className="bg-border/50" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground/80 uppercase tracking-wider font-bold">
              {t("paymentMethod")}
            </span>
            <span className="text-sm uppercase font-semibold text-foreground">
              {proposal.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground/80 uppercase tracking-wider font-bold">
              {t("paymentGateway")}
            </span>
            <span className="text-sm uppercase font-semibold text-foreground">
              {proposal.paymentGatewayId}
            </span>
          </div>

          <Separator className="bg-border/50" />

          <div className="flex justify-between items-center">
            <span className="text-sm font-bold uppercase tracking-tight text-primary">
              {t("totalValue")}
            </span>
            <div className="text-right">
              <span className="text-3xl font-black text-primary tracking-tighter">
                {formatCurrency(Number(proposal.totalValue))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
