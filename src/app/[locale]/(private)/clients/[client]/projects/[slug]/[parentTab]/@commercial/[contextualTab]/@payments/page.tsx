import { listInvoicesAction } from "@/actions/financial/listInvoicesAction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppError } from "@/errors/AppError";
import { operationWrapper } from "@/lib/operationWrapper";
import { getParams } from "@/utils/getParams";
import { TabsContent } from "@radix-ui/react-tabs";
import { Plus } from "lucide-react";
import { PaymentItem } from "./_components/PaymentItem";
import { CreateInvoceForm } from "./_components/CreateInvoiceForm";

interface IParams {
  params?: Promise<{ slug: string }>;
}

export default async function PaymentTab({ params }: IParams) {
  const { slug } = await getParams(params, ["slug"]);

  const [error, success] = await operationWrapper(
    "action",
    "listInvoicesAction",
    () => {
      return listInvoicesAction(slug);
    },
    {
      cache: "no-cache",
    }
  );

  if (error) {
    throw new AppError("Erro ao listar os pagamentos");
  }

  const payments = success.data ?? [];

  return (
    <TabsContent value="payments" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Histórico de Pagamentos</CardTitle>
          <CreateInvoceForm projectSlug={slug} />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payments.map((payment) => (
              <PaymentItem
                key={payment.id}
                payment={payment}
                projectSlug={slug}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
