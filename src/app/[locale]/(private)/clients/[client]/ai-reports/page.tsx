import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import { BrainCircuit, ShieldCheck } from "lucide-react";

export default function AiReport() {
  const hasAiReport = false;
  return (
    <TabsContent value="reports" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">ZofIA Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!hasAiReport && (
              <EmptyState
                title="Convide a ZofIA a fazer parte de sua equipe"
                icon={BrainCircuit}
                description="Ative a ZofIA Reports para receber diagnósticos automáticos sobre a saúde dos seus projetos e prove o valor do seu trabalho com relatórios profissionais gerados por IA."
                action={
                  <Link href={`/purchase/ai-reports`}>
                    <Button
                      type="button"
                      className="bg-primary hover:bg-primary/90 font-bold"
                    >
                      Liberar Relatórios Inteligentes
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
