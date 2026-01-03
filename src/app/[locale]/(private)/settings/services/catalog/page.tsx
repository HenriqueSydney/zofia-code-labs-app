import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

import { SectionHeading } from "@/components/SectionHeading";
import { CreateServiceTypeForm } from "./components/CreateServiceTypeForm";
import { formatCurrency } from "@/utils/formatCurrency";
import { EmptyState } from "@/components/EmptyState";
import { getParams } from "@/utils/getParams";
import { fetchServiceTypeAction } from "@/actions/services/fetchServiceTypeAction";
import { operationWrapper } from "@/lib/operationWrapper";
import { ServiceTypeRemoveOrEdit } from "./components/ServiceTypeRemoveOrEdit";
import { Tooltip } from "@/components/Tooltip";
import { fetchServiceCategoryAction } from "@/actions/services/fetchServiceCategoryAction";
import { QueryFilter } from "@/components/QueryFilter";

interface IParams {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}

const ServiceCatalog = async ({ searchParams }: IParams) => {
  const { query } = await getParams(searchParams, ["query"]);

  const [serviceCategoriesResponse, serviceTypeResponse] = await Promise.all([
    operationWrapper(
      "action",
      "fetchServiceCategoryAction",
      () => {
        return fetchServiceCategoryAction();
      },
      {
        cache: "no-cache",
      }
    ),
    operationWrapper(
      "action",
      "fetchServiceTypeAction",
      () => {
        return fetchServiceTypeAction(query);
      },
      {
        cache: "no-cache",
      }
    ),
  ]);

  const [serviceCategoriesError, serviceCategoriesSuccess] =
    serviceCategoriesResponse;

  const [serviceTypesError, serviceTypesSuccess] = serviceTypeResponse;

  const serviceTypes = serviceTypesError
    ? []
    : serviceTypesSuccess.serviceTypes;

  const categories = serviceCategoriesError
    ? []
    : serviceCategoriesSuccess.serviceCategories.map((category) => ({
        id: category.id,
        name: category.name,
      }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeading
          title="Catálogo de Serviços"
          description="Gerencie os serviços oferecidos pela empresa"
        />
        <CreateServiceTypeForm categories={categories} />
      </div>

      <QueryFilter placeholder="Buscar serviços..." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {serviceTypes.map((service) => (
          <Tooltip
            key={service.id}
            description={service.description}
            direction="top"
          >
            <Card
              key={service.id}
              className="flex flex-col hover:shadow-lg hover:scale-101 transition-all h-60"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {service.category.name}
                      </Badge>
                    </div>
                  </div>

                  <ServiceTypeRemoveOrEdit
                    service={service}
                    categories={categories}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between space-y-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                </div>

                <div>
                  <p className="text-xl font-bold text-primary text-end">
                    {formatCurrency(service.basePrice ?? 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Tooltip>
        ))}
      </div>

      {serviceTypes.length === 0 && (
        <EmptyState
          icon={Package}
          title="Nenhum serviço localizado"
          description="Cadastre os serviços que sua empresa fornece para que você possa montar propostas contextualizadas e com valor agregado"
        />
      )}
    </div>
  );
};

export default ServiceCatalog;
