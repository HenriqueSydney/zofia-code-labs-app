import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { BrainCircuit } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function AiReport() {
  const t = await getTranslations("clients.aiReports");
  const hasAiReport = false;

  return (
    <TabsContent value="reports" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!hasAiReport && (
              <>
                {/*
                  Purchase em construção — link temporariamente oculto:
                  <Link href={`/purchase/ai-reports`}>
                    <Button type="button" className="bg-primary hover:bg-primary/90 font-bold">
                      {t("cta")}
                    </Button>
                  </Link>
                */}
                <EmptyState
                  title={t("emptyTitle")}
                  icon={BrainCircuit}
                  description={t("emptyDescription")}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
