import { Badge } from "@/components/ui/badge";

export const getPaymentStatusBadge = (status: any) => {
  const config = {
    pending: { label: "Pendente", variant: "secondary" as const },
    invoiced: { label: "Faturado", variant: "outline" as const },
    paid: { label: "Pago", variant: "default" as const },
    overdue: { label: "Atrasado", variant: "destructive" as const },
  } as const;
  return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
};
