"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  ArrowRight,
  FileText,
  UserPlus,
  Mail,
  CreditCard,
  CheckCircle,
  Webhook,
} from "lucide-react";

interface ActivityLog {
  id: number;
  type:
    | "stage_change"
    | "document"
    | "team"
    | "email"
    | "payment"
    | "integration"
    | "milestone";
  message: string;
  details?: string;
  timestamp: string;
  user?: string;
}

const mockActivities: ActivityLog[] = [
  {
    id: 1,
    type: "stage_change",
    message: 'Projeto avançou para "Em Andamento"',
    details: "De: Planejado",
    timestamp: "2024-03-15T14:30:00",
    user: "João Silva",
  },
  {
    id: 2,
    type: "email",
    message: "Email enviado ao cliente",
    details: "Atualização de status semanal",
    timestamp: "2024-03-14T10:00:00",
  },
  {
    id: 3,
    type: "document",
    message: "Documento adicionado",
    details: "Termo de Aceite - Fase 1",
    timestamp: "2024-03-13T16:45:00",
    user: "Maria Santos",
  },
  {
    id: 4,
    type: "milestone",
    message: "Marco concluído",
    details: "Sprint 4 finalizada",
    timestamp: "2024-03-12T18:00:00",
  },
  {
    id: 5,
    type: "integration",
    message: "Webhook executado",
    details: "Notificação Slack enviada",
    timestamp: "2024-03-12T18:01:00",
  },
  {
    id: 6,
    type: "payment",
    message: "Pagamento recebido",
    details: "Parcela 2 de 4 - R$ 37.500,00",
    timestamp: "2024-03-10T09:15:00",
  },
  {
    id: 7,
    type: "team",
    message: "Membro adicionado à equipe",
    details: "Ana Costa",
    timestamp: "2024-03-08T11:30:00",
    user: "João Silva",
  },
];

const ProjectActivityLog = () => {
  const getIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "stage_change":
        return <ArrowRight className="h-3.5 w-3.5" />;
      case "document":
        return <FileText className="h-3.5 w-3.5" />;
      case "team":
        return <UserPlus className="h-3.5 w-3.5" />;
      case "email":
        return <Mail className="h-3.5 w-3.5" />;
      case "payment":
        return <CreditCard className="h-3.5 w-3.5" />;
      case "integration":
        return <Webhook className="h-3.5 w-3.5" />;
      case "milestone":
        return <CheckCircle className="h-3.5 w-3.5" />;
      default:
        return <Activity className="h-3.5 w-3.5" />;
    }
  };

  const getIconBg = (type: ActivityLog["type"]) => {
    switch (type) {
      case "stage_change":
        return "bg-primary/10 text-primary";
      case "document":
        return "bg-blue-500/10 text-blue-500";
      case "team":
        return "bg-violet-500/10 text-violet-500";
      case "email":
        return "bg-amber-500/10 text-amber-500";
      case "payment":
        return "bg-emerald-500/10 text-emerald-500";
      case "integration":
        return "bg-cyan-500/10 text-cyan-500";
      case "milestone":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Ontem";
    } else if (days < 7) {
      return `${days} dias atrás`;
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      });
    }
  };

  return (
    <Card className="lg:col-span-1 h-full max-h-[800px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Últimas Atualizações
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 overflow-y-auto pr-1">
          {mockActivities.map((activity, index) => (
            <div key={activity.id} className="flex gap-3 relative">
              {/* Timeline line */}
              {index < mockActivities.length - 1 && (
                <div className="absolute left-[13px] top-7 bottom-0 w-px bg-border" />
              )}

              {/* Icon */}
              <div
                className={`relative z-10 p-1.5 rounded-full ${getIconBg(
                  activity.type
                )}`}
              >
                {getIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-3">
                <p className="text-sm font-medium">{activity.message}</p>
                {activity.details && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.details}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{formatTime(activity.timestamp)}</span>
                  {activity.user && (
                    <>
                      <span>•</span>
                      <span>{activity.user}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectActivityLog;
