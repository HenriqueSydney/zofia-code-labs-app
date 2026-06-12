import { Badge } from "@/components/ui/badge";
import { Contract } from "@/generated/prisma/client";

export const CONTRACT_STATUS_TRANSLATION_KEYS: Record<
  Contract["status"],
  string
> = {
  SIGNED: "signed",
  CANCELLED: "cancelled",
  DRAFT: "draft",
  REJECTED: "rejected",
  REVIEW: "review",
  SENT: "sent",
} as const;

export function getContractStatusLabel(
  status: Contract["status"],
  t: (key: string) => string,
): string {
  const key = CONTRACT_STATUS_TRANSLATION_KEYS[status];
  return t(`status.${key}`);
}

type ContractMapperType = {
  label: string;
  variant: "secondary" | "outline" | "destructive" | "default";
};

export const contractStatusBadge = (
  status: Contract["status"],
  t: (key: string) => string,
) => {
  const label = getContractStatusLabel(status, t);

  const config: Record<Contract["status"], ContractMapperType> = {
    DRAFT: { label, variant: "secondary" },
    REVIEW: { label, variant: "outline" },
    SENT: { label, variant: "default" },
    SIGNED: { label, variant: "default" },
    REJECTED: { label, variant: "destructive" },
    CANCELLED: { label, variant: "destructive" },
  };

  return (
    <Badge variant={config[status]?.variant ?? "default"}>
      {config[status]?.label ?? getContractStatusLabel("DRAFT", t)}
    </Badge>
  );
};
