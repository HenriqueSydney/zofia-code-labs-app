import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { date } from "@/lib/dayjs";
import {
  getNotificationIcon,
  getNotificationStatusBadge,
} from "@/mappers/notificationMapper";
import { getPaymentStatusBadge } from "@/mappers/paymentStatusBadge";
import { formatCurrency } from "@/utils/formatCurrency";
import { TabsContent } from "@radix-ui/react-tabs";
import { Calendar, DollarSign, Eye, Plus, Send, User } from "lucide-react";

const mockNotifications: any[] = [
  {
    id: "1",
    type: "email",
    subject: "Proposta Comercial - Sistema de Gestão v2.0",
    recipient: "joao.pereira@empresa.com",
    sentAt: "2024-01-17T09:00:00",
    sentBy: "Ana Silva",
    status: "read",
  },
  {
    id: "2",
    type: "email",
    subject: "Contrato para Assinatura",
    recipient: "joao.pereira@empresa.com",
    sentAt: "2024-01-20T10:30:00",
    sentBy: "Ana Silva",
    status: "read",
  },
  {
    id: "3",
    type: "whatsapp",
    subject: "Lembrete: Pagamento da entrada",
    recipient: "+55 11 99999-9999",
    sentAt: "2024-01-23T14:00:00",
    sentBy: "Sistema",
    status: "delivered",
  },
  {
    id: "4",
    type: "email",
    subject: "Nota Fiscal NF-2024-001",
    recipient: "joao.pereira@empresa.com",
    sentAt: "2024-01-24T16:00:00",
    sentBy: "Sistema",
    status: "delivered",
  },
];

export default function NotificationTab() {
  return (
    <TabsContent value="notifications" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Histórico de Notificações</CardTitle>
          <Button size="sm">
            <Send className="h-4 w-4 mr-2" />
            Nova Notificação
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <div className="p-2 rounded-lg bg-muted">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {notification.subject}
                      </p>
                      {getNotificationStatusBadge(notification.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>Para: {notification.recipient}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {date(notification.sentAt).format("DD/MM/YYYY HH:mm")}
                      </span>
                      <span>•</span>
                      <User className="h-3 w-3" />
                      <span>{notification.sentBy}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
