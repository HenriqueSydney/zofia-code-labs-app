import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SuccessToastComponent } from "@/components/SuccessToastComponent";
import { getParams } from "@/utils/getParams";
import { TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IContractTab {
  params: Promise<{
    slug: string;
    contextualTab: string;
    page?: number;
    numberPerPage?: number;
  }>;
}

export default async function ContractTab({ params }: IContractTab) {
  const {
    slug,
    page = 1,
    numberPerPage = 10,
  } = await getParams<{ slug: string; page: number; numberPerPage: number }>(
    params,
    ["slug", "page", "numberPerPage"]
  );

  return (
    <TabsContent value="web-analytics" className="mt-6">
      <SuccessToastComponent />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Web Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Umami Analytics"
            description="Análise de web de código aberto, focada em privacidade e simples de usar"
            icon={List}
            action={<Button>Criar projeto e iniciar integração</Button>}
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
