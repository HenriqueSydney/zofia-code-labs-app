import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateNewContractButton } from "./CreateNewContractButton";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { fetchContractHistory } from "@/actions/contract/fetchContractHistory";
import { SuccessToastComponent } from "@/components/SuccessToastComponent";
import { getParams } from "@/utils/getParams";
import { operationWrapper } from "@/lib/operationWrapper";
import { AppError } from "@/errors/AppError";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { getProjectBySlugAction } from "@/actions/projects/getProjectBySlug";
import { ContractList } from "@/components/ContractList";
import { TabsContent } from "@/components/ui/tabs";

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
  const [projectError, projectSuccess] = await operationWrapper<{
    project: ProjectWithDetails;
  }>(
    "action",
    "getProjectAction",
    () => {
      return getProjectBySlugAction(slug);
    },
    {
      cache: "no-cache",
    }
  );

  if (projectError) throw new AppError("Falha ao tentar localizar o projeto");

  const project = projectSuccess.project;

  const [error, success] = await operationWrapper<{
    contracts: ContractWithDetails[];
    totalOfRegister: number;
  }>(
    "action",
    "fetchContractHistory",
    () => {
      return fetchContractHistory(project.id, { page, numberPerPage });
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
      <SuccessToastComponent />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Histórico de Contratos do Projeto
          </CardTitle>
          <CreateNewContractButton project={project} />
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
