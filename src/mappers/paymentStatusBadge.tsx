import { Badge } from "@/components/ui/badge";

export type PaymentBadgeStatus =
  | "pending"
  | "invoiced"
  | "paid"
  | "overdue";

export const PAYMENT_STATUS_TRANSLATION_KEYS: Record<
  PaymentBadgeStatus,
  string
> = {
  pending: "pending",
  invoiced: "invoiced",
  paid: "paid",
  overdue: "overdue",
} as const;

export function getPaymentStatusLabel(
  status: PaymentBadgeStatus,
  t: (key: string) => string,
): string {
  const key = PAYMENT_STATUS_TRANSLATION_KEYS[status];
  return t(key);
}

type PaymentMapperType = {
  label: string;
  variant: "secondary" | "outline" | "destructive" | "default";
};

export const getPaymentStatusBadge = (
  status: PaymentBadgeStatus,
  t: (key: string) => string,
) => {
  const label = getPaymentStatusLabel(status, t);

  const config: Record<PaymentBadgeStatus, PaymentMapperType> = {
    pending: { label, variant: "secondary" },
    invoiced: { label, variant: "outline" },
    paid: { label, variant: "default" },
    overdue: { label, variant: "destructive" },
  };

  return (
    <Badge variant={config[status]?.variant ?? "default"}>
      {config[status]?.label ?? getPaymentStatusLabel("pending", t)}
    </Badge>
  );
};
