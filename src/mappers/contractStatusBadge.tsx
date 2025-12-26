import { Badge } from "@/components/ui/badge";
import { Contract } from "@/generated/prisma/client";

type ContractMapperType = {
  label: string;
  variant: "secondary" | "outline" | "destructive" | "default";
};

export const contractStatusBadge = (status: Contract["status"]) => {
  const config: Record<Contract["status"], ContractMapperType> = {
    DRAFT: { label: "Rascunho", variant: "secondary" },
    REVIEW: { label: "Em Revisão", variant: "outline" },
    SENT: { label: "Enviada", variant: "default" },
    SIGNED: { label: "Assinado", variant: "default" },
    REJECTED: { label: "Rejeitada", variant: "destructive" },
    CANCELLED: { label: "Cancelada", variant: "destructive" },
  };
  return (
    <Badge variant={config[status]?.variant ?? "default"}>
      {config[status]?.label ?? "Rascunho"}
    </Badge>
  );
};
