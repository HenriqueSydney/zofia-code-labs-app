import { SectionHeading } from "@/components/SectionHeading";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { operationWrapper } from "@/lib/operationWrapper";
import { ValidationError } from "@/errors";
import { QueryFilter } from "@/components/QueryFilter";
import { fetchAllContracts } from "@/actions/contract/fetchAllContracts";
import { getParams } from "@/utils/getParams";
import { ContractList } from "@/components/ContractList";
import { getTranslations } from "next-intl/server";

interface IParams {
  searchParams: Promise<{
    query?: string;
    page?: number;
    numberPerPage?: number;
  }>;
}

export default async function Contracts({ searchParams }: IParams) {
  const t = await getTranslations("contracts.page");
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
    throw new ValidationError(t("fetchError"));
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        title={t("title")}
        description={t("description")}
      />
      <QueryFilter placeholder={t("search")} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t("historyTitle")}</CardTitle>
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
