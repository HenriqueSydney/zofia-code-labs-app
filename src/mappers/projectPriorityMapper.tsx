import { Badge } from "@/components/ui/badge";
import { Priority, Proposal } from "@/generated/prisma/client";

const priorityMapper: Record<Priority, string> = {
  URGENT: "Urgente",
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
} as const;

export const priorityOptions = Object.entries(priorityMapper).map(
  ([value, label]) => ({
    label,
    value,
  }),
);

type PriorityMapperType = {
  label: string;
  variant: "secondary" | "outline" | "destructive" | "default";
};

export const getProjectPriorityBadge = (priority: Priority) => {
  const config: Record<Priority, PriorityMapperType> = {
    URGENT: { label: priorityMapper["URGENT"], variant: "destructive" },
    HIGH: { label: priorityMapper["HIGH"], variant: "default" },
    MEDIUM: { label: priorityMapper["MEDIUM"], variant: "secondary" },
    LOW: { label: priorityMapper["LOW"], variant: "outline" },
  };
  return (
    <Badge variant={config[priority]?.variant ?? "outline"}>
      {config[priority]?.label ?? priorityMapper["LOW"]}
    </Badge>
  );
};
