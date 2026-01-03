import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import { ShieldCheck } from "lucide-react";

export default function Metrics() {
  const hasMetrics = false;
  return (
    <TabsContent value="metrics" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Métricas dos projetos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!hasMetrics && (
              <EmptyState
                title="Você gostaria de acompanhar a saúde e a qualidade de seus projetos?"
                icon={ShieldCheck}
                description="Ative o Metrics para consolidar indicadores de qualidade, vulnerabilidades e produtividade em um único dashboard profissional."
                action={
                  <Link href={`/purchase/metrics`}>
                    <Button
                      type="button"
                      className="bg-primary hover:bg-primary/90 font-bold"
                    >
                      Acompanhar as Métricas
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
