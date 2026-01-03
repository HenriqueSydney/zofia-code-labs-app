import { SectionHeading } from "@/components/SectionHeading";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { operationWrapper } from "@/lib/operationWrapper";
import { AppError } from "@/errors/AppError";
import { QueryFilter } from "@/components/QueryFilter";
import { fetchAllContracts } from "@/actions/contract/fetchAllContracts";
import { getParams } from "@/utils/getParams";
import { ContractList } from "@/components/ContractList";

interface IParams {
  searchParams: Promise<{
    query?: string;
    page?: number;
    numberPerPage?: number;
  }>;
}

export default async function Contracts({ searchParams }: IParams) {
  const {
    query,
    page = 1,
    numberPerPage = 10,
  } = await getParams(searchParams, ["query", "page", "numberPerPage"]);
  const [error, success] = await operationWrapper<{
    contracts: ContractWithDetails[];
    totalOfRegister: number;
  }>(
    "action",
    "fetchAllContracts",
    () => {
      return fetchAllContracts({ query }, { page, numberPerPage });
    },
    {
      cache: "no-cache",
    }
  );

  if (error) {
    throw new AppError("Falha ao tentar localizar o histórico de contratos");
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Gestão de contratos"
        description="Gerencie todos os contratos de sua Empresa"
      />
      <QueryFilter placeholder="Buscar contrato..." />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Histórico de Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractList
            contracts={success.contracts}
            totalOfRegister={success.totalOfRegister}
          />
        </CardContent>
      </Card>
    </div>
  );
}
