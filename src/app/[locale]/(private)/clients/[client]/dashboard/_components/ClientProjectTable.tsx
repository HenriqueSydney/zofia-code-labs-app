"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { date } from "@/lib/dayjs";
import { DataTable } from "@/components/DataTable";
import { allStages } from "@/mappers/projectStageMapper";

const projectColumns: ColumnDef<
  Omit<ProjectWithDetails, "projectServices" | "proposal">
>[] = [
  {
    accessorKey: "name",
    header: "Nome do Projeto",
    cell: ({ row }) => (
      <span className="font-medium text-white">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = allStages.find(
        (stage) => stage.key === row.original.status,
      );

      return (
        <Badge
          variant="outline"
          className={`border-0 ${status?.color || "bg-secondary"}`}
        >
          {status?.label || row.original.status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "deliveryDate",
    header: "Prev. Entrega",
    cell: ({ row }) => {
      const deliveryDate = row.original.endDate;
      if (!deliveryDate) {
        return <span className="text-muted-foreground">-</span>;
      }

      return <span>{date(deliveryDate as Date).format("DD/MM/YYYY")}</span>;
    },
  },
  {
    accessorKey: "lastUpdate",
    header: "Última Atualização",
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
    header: "Financeiro",
    // Meta property para alinhar à direita (suportada pelo DataTable genérico acima)
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
            {isPaid ? "Em dia" : "Pendente"}
          </Badge>
        </div>
      );
    },
  },
];

interface IClientProjectTable {
  data: Omit<ProjectWithDetails, "projectServices" | "proposal">[];
}

export function ClientProjectTable({ data }: IClientProjectTable) {
  return (
    <DataTable title="Seus Projetos" columns={projectColumns} data={data} />
  );
}
