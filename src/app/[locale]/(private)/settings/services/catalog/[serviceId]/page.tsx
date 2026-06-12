import { operationWrapper } from "@/lib/operationWrapper";
import { getParams } from "@/utils/getParams";
import { ValidationError } from "@/errors";
import { BacklogFilter } from "./_components/BacklogFilter";
import { BacklogList } from "./_components/BacklogList";
import { BacklogPriority } from "@/generated/prisma/enums";
import { auth } from "@/auth";
import { EmptyState } from "@/components/EmptyState";
import { ListTodo } from "lucide-react";
import { BacklogCreateForm } from "./_components/BacklogCreateForm";
import { getServiceTypeAction } from "@/actions/services/getServiceTypeAction";
import { FetchServiceTypeWithCategory } from "@/repositories/IServiceTypeRepository";
import { listServiceDefaultBacklogsItemsAction } from "@/actions/services/backlogs/listServiceDefaultBacklogsItemsAction";
import { ServiceDefaultBacklogItemWithDetails } from "@/repositories/IServiceDefaultBacklogItemsRepository";
import { ServiceHeaderDetails } from "./_components/ServiceHeaderDetails";
import { PERMISSIONS } from "@/constants/permissions";
import { assertPermission, hasPermission } from "@/utils/hasPermission";
import { getTranslations } from "next-intl/server";

interface IBacklog {
  params: Promise<{ serviceId: string }>;
  searchParams: Promise<{
    query: string;
    priority: string;
  }>;
}

export default async function Backlog({ params, searchParams }: IBacklog) {
  const t = await getTranslations("settings.services.backlog");
  const tErrors = await getTranslations("projects.errors");
  const tCommon = await getTranslations("common.errors");
  const { serviceId } = await getParams<{
    serviceId: string;
  }>(params, ["serviceId"]);

  const { priority, query } = await getParams<{
    query: string;
    priority: BacklogPriority;
  }>(searchParams, ["priority", "query"]);
  const session = await auth();

  if (!session) throw new ValidationError(tCommon("unauthenticated"));

  assertPermission(
    session.user,
    PERMISSIONS.SERVICE_CATALOG.READ,
    tErrors("serviceAccessDenied"),
  );

  const canEditBacklog = hasPermission(
    session.user,
    PERMISSIONS.SERVICE_BACKLOG.MANAGE,
  );

  const canReadBacklog = hasPermission(
    session.user,
    PERMISSIONS.SERVICE_BACKLOG.READ,
  );

  const [serviceTypeResponse, defaultBacklogResponse] = await Promise.all([
    operationWrapper<{
      serviceType: FetchServiceTypeWithCategory;
    }>(
      "action",
      "getServiceTypeAction",
      () => {
        return getServiceTypeAction(serviceId);
      },
      {
        cache: "no-cache",
      },
    ),
    operationWrapper<{
      totalOfRegisters: number;
      totalPoints: number;
      items: ServiceDefaultBacklogItemWithDetails[];
    }>(
      "action",
      "listServiceDefaultBacklogsItemsAction",
      () => {
        return listServiceDefaultBacklogsItemsAction({
          serviceId,
          query,
          priority,
        });
      },
      {
        cache: "no-cache",
      },
    ),
  ]);

  const [serviceTypeError, serviceTypeSuccess] = serviceTypeResponse;

  if (serviceTypeError) throw new ValidationError(tErrors("serviceNotFound"));

  const serviceType = serviceTypeSuccess.serviceType;

  const [error, success] = defaultBacklogResponse;

  let backlogItems: ServiceDefaultBacklogItemWithDetails[] = [];

  if (!error) {
    backlogItems = success.items;
  }

  const backlogTotalOfRegisters = backlogItems.length;

  return (
    <div className="space-y-6">
      <ServiceHeaderDetails service={serviceType} />

      {canReadBacklog && (
        <BacklogFilter serviceId={serviceId} canEditBacklog={canEditBacklog} />
      )}

      {!canReadBacklog && (
        <EmptyState
          title="Acesso restrito"
          icon={ListTodo}
          description={t("noPermissionBacklog")}
        />
      )}

      {backlogTotalOfRegisters === 0 && canEditBacklog && (
        <EmptyState
          title="Backlog do Produto"
          icon={ListTodo}
          description={t("emptyDescription")}
          action={<BacklogCreateForm serviceId={serviceId} />}
        />
      )}

      {backlogTotalOfRegisters > 0 && canReadBacklog && (
        <BacklogList
          serviceTypeId={serviceId}
          backlog={backlogItems}
          canEditBacklog={canEditBacklog}
        />
      )}
    </div>
  );
}
