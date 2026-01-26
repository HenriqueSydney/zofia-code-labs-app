import { operationWrapper } from "@/lib/operationWrapper";
import { getParams } from "@/utils/getParams";
import { AppError } from "@/errors/AppError";
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

interface IBacklog {
  params: Promise<{ serviceId: string }>;
  searchParams: Promise<{
    query: string;
    priority: string;
  }>;
}

export default async function Backlog({ params, searchParams }: IBacklog) {
  const { serviceId } = await getParams<{
    serviceId: string;
  }>(params, ["serviceId"]);

  const { priority, query } = await getParams<{
    query: string;
    priority: BacklogPriority;
  }>(searchParams, ["priority", "query"]);
  const session = await auth();

  if (!session) throw new AppError("Usuário não autenticado");

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

  if (serviceTypeError) throw new AppError("Serviço não localizado");

  const serviceType = serviceTypeSuccess.serviceType;

  const [error, success] = defaultBacklogResponse;

  if (error) {
    throw new AppError("Lista de backlog não localizada");
  }

  const backlogTotalOfRegisters = success.items.length;

  return (
    <div className="space-y-6">
      <ServiceHeaderDetails service={serviceType} />

      <BacklogFilter serviceId={serviceId} />

      {backlogTotalOfRegisters === 0 && (
        <EmptyState
          title="Backlog do Produto"
          icon={ListTodo}
          description="Nenhum item de backlog cadastrado até o momento. Inicie a gestão do backlog com o cadastramento de ao menos 1 item."
          action={<BacklogCreateForm serviceId={serviceId} />}
        />
      )}

      {backlogTotalOfRegisters > 0 && (
        <BacklogList serviceTypeId={serviceId} backlog={success.items} />
      )}
    </div>
  );
}
