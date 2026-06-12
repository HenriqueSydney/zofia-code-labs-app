import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateNewContractButton } from "./CreateNewContractButton";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { fetchContractHistory } from "@/actions/contract/fetchContractHistory";
import { getParams } from "@/utils/getParams";
import { operationWrapper } from "@/lib/operationWrapper";
import { ValidationError } from "@/errors";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { getProjectBySlugAction } from "@/actions/projects/getProjectBySlug";
import { ContractList } from "@/components/ContractList";
import { TabsContent } from "@/components/ui/tabs";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { FileSignature } from "lucide-react";
import { hasPermission } from "@/utils/hasPermission";
import { PERMISSIONS } from "@/constants/permissions";
import { EmptyState } from "@/components/EmptyState";

interface IContractTab {
  params: Promise<{
    slug: string;
    contextualTab: string;
    page?: number;
    numberPerPage?: number;
  }>;
}

export default async function ContractTab({ params }: IContractTab) {
  const t = await getTranslations("projects.commercial.contracts");
  const tErrors = await getTranslations("projects.errors");
  const session = await auth();
  const {
    slug,
    page = 1,
    numberPerPage = 10,
  } = await getParams<{ slug: string; page: number; numberPerPage: number }>(
    params,
    ["slug", "page", "numberPerPage"],
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
    },
  );

  if (projectError) throw new ValidationError(t("fetchProjectError"));

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
    },
  );

  if (error) {
    throw new ValidationError(t("fetchHistoryError"));
  }
  const canCreateContract = hasPermission(
    session?.user,
    PERMISSIONS.CONTRACT.CREATE,
  );
  const canReadContract = hasPermission(
    session?.user,
    PERMISSIONS.CONTRACT.READ,
  );
  if (!canReadContract) {
    return (
      <EmptyState
        title={tErrors("noPermissionTitle")}
        icon={FileSignature}
        description={tErrors("noPermissionContract")}
      />
    );
  }

  return (
    <TabsContent value="contracts" className="mt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t("historyTitle")}</CardTitle>
          {canCreateContract && <CreateNewContractButton project={project} />}
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
