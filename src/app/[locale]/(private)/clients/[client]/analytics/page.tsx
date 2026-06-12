import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { ChartNoAxesCombined } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function Analytics() {
  const t = await getTranslations("clients.analytics");
  const hasAnalytics = false;

  return (
    <TabsContent value="analytics" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!hasAnalytics && (
              <>
                {/*
                  Purchase em construção — link temporariamente oculto:
                  <Link href={`/purchase/analytics`}>
                    <Button type="button" className="bg-primary hover:bg-primary/90">
                      {t("empty.cta")}
                    </Button>
                  </Link>
                */}
                <EmptyState
                  title={t("empty.title")}
                  icon={ChartNoAxesCombined}
                  description={t("empty.description")}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
