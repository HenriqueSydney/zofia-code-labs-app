import { Badge } from "@/components/ui/badge";
import { Proposal } from "@/generated/prisma/client";

export const PROPOSAL_STATUS_TRANSLATION_KEYS: Record<
  Proposal["status"],
  string
> = {
  DRAFT: "draft",
  REVIEW: "review",
  APPROVED: "approved",
  SENT: "sent",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export function getProposalStatusLabel(
  status: Proposal["status"],
  t: (key: string) => string,
): string {
  const key = PROPOSAL_STATUS_TRANSLATION_KEYS[status];
  return t(`status.${key}`);
}

type ProposalMapperType = {
  label: string;
  variant: "secondary" | "outline" | "destructive" | "default";
};

export const getProposalStatusBadge = (
  status: Proposal["status"],
  t: (key: string) => string,
) => {
  const label = getProposalStatusLabel(status, t);

  const config: Record<Proposal["status"], ProposalMapperType> = {
    DRAFT: { label, variant: "secondary" },
    REVIEW: { label, variant: "outline" },
    APPROVED: { label, variant: "default" },
    SENT: { label, variant: "default" },
    ACCEPTED: { label, variant: "default" },
    REJECTED: { label, variant: "destructive" },
    CANCELLED: { label, variant: "destructive" },
  };

  return (
    <Badge variant={config[status]?.variant ?? "default"}>
      {config[status]?.label ?? getProposalStatusLabel("DRAFT", t)}
    </Badge>
  );
};
