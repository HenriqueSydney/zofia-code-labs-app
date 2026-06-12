import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function Metrics() {
  const t = await getTranslations("clients.metrics");
  const hasMetrics = false;

  return (
    <TabsContent value="metrics" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!hasMetrics && (
              <>
                {/*
                  Purchase em construção — link temporariamente oculto:
                  <Link href={`/purchase/metrics`}>
                    <Button type="button" className="bg-primary hover:bg-primary/90 font-bold">
                      {t("empty.cta")}
                    </Button>
                  </Link>
                */}
                <EmptyState
                  title={t("empty.title")}
                  icon={ShieldCheck}
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
