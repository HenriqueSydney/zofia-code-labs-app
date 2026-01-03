import { ContractWithDetails } from "@/repositories/IContractRepository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { operationWrapper } from "@/lib/operationWrapper";
import { AppError } from "@/errors/AppError";
import { fetchContractHistoryByClient } from "@/actions/contract/fetchContractHistoryByClient";
import { TabsContent } from "@/components/ui/tabs";
import { ContractList } from "@/components/ContractList";

interface IContracts {
  params: Promise<{ client: string; page?: number; numberPerPage?: number }>;
}

export default async function Contracts({ params }: IContracts) {
  const { client: slug, page = 1, numberPerPage = 10 } = await params;
  const [error, success] = await operationWrapper<{
    contracts: ContractWithDetails[];
    totalOfRegister: number;
  }>(
    "action",
    "fetchContractHistoryByClient",
    () => {
      return fetchContractHistoryByClient(slug, { page, numberPerPage });
    },
    {
      cache: "no-cache",
    }
  );

  if (error) {
    throw new AppError("Falha ao tentar localizar o histórico de contratos");
  }

  return (
    <TabsContent value="contracts" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Histórico de Contratos do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContractList
            contracts={success.contracts}
            totalOfRegister={success.totalOfRegister}
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
