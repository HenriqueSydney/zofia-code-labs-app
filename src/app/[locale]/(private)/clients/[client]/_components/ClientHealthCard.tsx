import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

export async function ClientHealthCard() {
  const t = await getTranslations("clients.health");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-end">
          <span className="text-sm text-muted-foreground">{t("nps")}</span>
          <span className="text-2xl font-bold text-green-500">9.2</span>
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <div className="bg-green-500 h-full w-[92%]" />
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("lastContact")}</span>
            <span>14/10/2023</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("averageTicket")}</span>
            <span>R$ 12.400,00</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
