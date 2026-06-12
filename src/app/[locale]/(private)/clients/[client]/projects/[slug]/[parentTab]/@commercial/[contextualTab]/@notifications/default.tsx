import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { date } from "@/lib/dayjs";
import {
  getNotificationIcon,
  getNotificationStatusBadge,
} from "@/mappers/notificationMapper";
import { TabsContent } from "@radix-ui/react-tabs";
import { Calendar, Eye, Send, User } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function NotificationTab() {
  const t = await getTranslations("projects.commercial.notifications");

  const mockNotifications = [
    {
      id: "1",
      type: "email" as const,
      subject: t("mock.proposalSubject"),
      recipient: "joao.pereira@empresa.com",
      sentAt: "2024-01-17T09:00:00",
      sentBy: "Ana Silva",
      status: "read" as const,
    },
    {
      id: "2",
      type: "email" as const,
      subject: t("mock.contractSubject"),
      recipient: "joao.pereira@empresa.com",
      sentAt: "2024-01-20T10:30:00",
      sentBy: "Ana Silva",
      status: "read" as const,
    },
    {
      id: "3",
      type: "whatsapp" as const,
      subject: t("mock.paymentReminder"),
      recipient: "+55 11 99999-9999",
      sentAt: "2024-01-23T14:00:00",
      sentBy: t("mock.systemSender"),
      status: "delivered" as const,
    },
    {
      id: "4",
      type: "email" as const,
      subject: t("mock.invoiceSubject"),
      recipient: "joao.pereira@empresa.com",
      sentAt: "2024-01-24T16:00:00",
      sentBy: t("mock.systemSender"),
      status: "delivered" as const,
    },
  ];

  return (
    <TabsContent value="notifications" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <Button size="sm">
            <Send className="h-4 w-4 mr-2" />
            {t("newNotification")}
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
                      <span>
                        {t("to")} {notification.recipient}
                      </span>
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
