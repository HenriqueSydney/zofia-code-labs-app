"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { date } from "@/lib/dayjs";
import { DataTable } from "@/components/DataTable";
import { allStages, translateStageConfig } from "@/mappers/projectStageMapper";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

interface IClientProjectTable {
  data: Omit<ProjectWithDetails, "projectServices" | "proposal">[];
}

export function ClientProjectTable({ data }: IClientProjectTable) {
  const t = useTranslations("clients.dashboard.table");
  const tStages = useTranslations("projects.stages");
  const stageT = (key: string) =>
    tStages(key as Parameters<typeof tStages>[0]);

  const projectColumns: ColumnDef<
    Omit<ProjectWithDetails, "projectServices" | "proposal">
  >[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: t("projectName"),
        cell: ({ row }) => (
          <span className="font-medium text-white">{row.getValue("name")}</span>
        ),
      },
      {
        accessorKey: "status",
        header: t("status"),
        cell: ({ row }) => {
          const stage = allStages.find(
            (item) => item.key === row.original.status,
          );
          const label = stage
            ? translateStageConfig(stage, stageT).label
            : row.original.status;

          return (
            <Badge
              variant="outline"
              className={`border-0 ${stage?.color || "bg-secondary"}`}
            >
              {label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "deliveryDate",
        header: t("expectedDelivery"),
        cell: ({ row }) => {
          const deliveryDate = row.original.endDate;
          if (!deliveryDate) {
            return <span className="text-muted-foreground">-</span>;
          }

          return (
            <span>{date(deliveryDate as Date).format("DD/MM/YYYY")}</span>
          );
        },
      },
      {
        accessorKey: "lastUpdate",
        header: t("lastUpdate"),
        cell: ({ row }) => {
          const lastUpdate = row.original.updatedAt;
          return (
            <span className="text-muted-foreground">
              {date(lastUpdate as Date).fromNow()}
            </span>
          );
        },
      },
      {
        accessorKey: "financialStatus",
        header: t("financial"),
        meta: {
          className: "text-right",
        },
        cell: ({ row }) => {
          const status = row.original.health;
          const isPaid = status === "PAID" || status === "ON_TRACK";

          return (
            <div className="flex justify-end">
              <Badge
                variant="outline"
                className={
                  isPaid
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                }
              >
                {isPaid ? t("financialPaid") : t("financialPending")}
              </Badge>
            </div>
          );
        },
      },
    ],
    [t, tStages],
  );

  return (
    <DataTable title={t("title")} columns={projectColumns} data={data} />
  );
}
