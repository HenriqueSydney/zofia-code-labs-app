import { Badge } from "@/components/ui/badge";
import { Proposal } from "@/generated/prisma/client";

type ProposalMapperType = {
  label: string;
  variant: "secondary" | "outline" | "destructive" | "default";
};

export const getProposalStatusBadge = (status: Proposal["status"]) => {
  const config: Record<Proposal["status"], ProposalMapperType> = {
    DRAFT: { label: "Rascunho", variant: "secondary" },
    REVIEW: { label: "Em Revisão", variant: "outline" },
    APPROVED: { label: "Aprovada", variant: "default" },
    SENT: { label: "Enviada", variant: "default" },
    ACCEPTED: { label: "Aceita", variant: "default" },
    REJECTED: { label: "Rejeitada", variant: "destructive" },
  };
  return (
    <Badge variant={config[status]?.variant ?? "default"}>
      {config[status]?.label ?? "Rascunho"}
    </Badge>
  );
};
