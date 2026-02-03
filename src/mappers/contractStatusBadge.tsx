import { Badge } from "@/components/ui/badge";
import { Contract } from "@/generated/prisma/client";

type ContractMapperType = {
  label: string;
  variant: "secondary" | "outline" | "destructive" | "default";
};

export const contratMapper: Record<Contract["status"], string> = {
  SIGNED: "Assinado",
  CANCELLED: "Cancelada",
  DRAFT: "Rascunho",
  REJECTED: "Rejeitada",
  REVIEW: "Em Revisão",
  SENT: "Enviada",
} as const;

export const contractStatusBadge = (status: Contract["status"]) => {
  const config: Record<Contract["status"], ContractMapperType> = {
    DRAFT: { label: contratMapper["DRAFT"], variant: "secondary" },
    REVIEW: { label: contratMapper["REVIEW"], variant: "outline" },
    SENT: { label: contratMapper["SENT"], variant: "default" },
    SIGNED: { label: contratMapper["SIGNED"], variant: "default" },
    REJECTED: { label: contratMapper["REJECTED"], variant: "destructive" },
    CANCELLED: { label: contratMapper["CANCELLED"], variant: "destructive" },
  };
  return (
    <Badge variant={config[status]?.variant ?? "default"}>
      {config[status]?.label ?? "Rascunho"}
    </Badge>
  );
};
