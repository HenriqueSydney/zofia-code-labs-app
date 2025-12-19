import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare } from "lucide-react";

export const getNotificationIcon = (type: any) => {
  switch (type) {
    case "email":
      return <Mail className="h-4 w-4" />;
    case "sms":
      return <MessageSquare className="h-4 w-4" />;
    case "whatsapp":
      return <MessageSquare className="h-4 w-4 text-green-500" />;
  }
};

export const getNotificationStatusBadge = (status: any) => {
  const config = {
    sent: { label: "Enviado", variant: "secondary" as const },
    delivered: { label: "Entregue", variant: "outline" as const },
    read: { label: "Lido", variant: "default" as const },
    failed: { label: "Falhou", variant: "destructive" as const },
  };
  return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
};
