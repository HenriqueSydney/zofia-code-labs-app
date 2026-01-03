import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import { ChartNoAxesCombined } from "lucide-react";

export default function Analytics() {
  const hasAnalytics = false;
  return (
    <TabsContent value="analytics" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Web Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!hasAnalytics && (
              <EmptyState
                title="Tome decisões baseadas em dados reais"
                icon={ChartNoAxesCombined}
                description="Você está no escuro sobre como seus usuários interagem? Ative o Analytics e descubra gargalos, 
  visualize o engajamento em tempo real e evolua seus produtos com clareza estratégica."
                action={
                  <Link href={`/purchase/analytics`}>
                    <Button
                      type="button"
                      className="bg-primary hover:bg-primary/90"
                    >
                      Desbloquear Insights Agora
                    </Button>
                  </Link>
                }
              />
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
