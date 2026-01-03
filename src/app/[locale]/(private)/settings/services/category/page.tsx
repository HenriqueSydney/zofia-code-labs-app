import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Boxes, Package } from "lucide-react";

import { SectionHeading } from "@/components/SectionHeading";
import { CreateServiceCategoryForm } from "./components/CreateServiceCategoryForm";
import { EmptyState } from "@/components/EmptyState";
import { getParams } from "@/utils/getParams";
import { fetchServiceCategoryAction } from "@/actions/services/fetchServiceCategoryAction";
import { operationWrapper } from "@/lib/operationWrapper";
import { ServiceCategoryRemoveOrEdit } from "./components/ServiceCategoryRemoveOrEdit";
import { Tooltip } from "@/components/Tooltip";
import { QueryFilter } from "@/components/QueryFilter";

interface IParams {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}

const ServiceCategory = async ({ searchParams }: IParams) => {
  const { query } = await getParams(searchParams, ["query"]);

  const [serviceCategorysError, serviceCategorysSuccess] =
    await operationWrapper(
      "action",
      "fetchServiceCategoryAction",
      () => {
        return fetchServiceCategoryAction(query);
      },
      {
        cache: "no-cache",
      }
    );

  const serviceCategories = serviceCategorysError
    ? []
    : serviceCategorysSuccess.serviceCategories;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeading
          title="Categoria de Serviços"
          description="Gerencie as categorias de serviços oferecidos pela empresa"
        />
        <CreateServiceCategoryForm categories={[]} />
      </div>

      <QueryFilter placeholder="Buscar categoria..." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {serviceCategories.map((serviceCategory) => (
          <Tooltip
            key={serviceCategory.id}
            description={serviceCategory.description}
            direction="top"
          >
            <Card
              key={serviceCategory.id}
              className="flex flex-col hover:shadow-lg hover:scale-101 transition-all h-40"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {serviceCategory.name}
                      </CardTitle>
                    </div>
                  </div>

                  <ServiceCategoryRemoveOrEdit
                    serviceCategory={serviceCategory}
                    categories={[]}
                  />
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between space-y-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {serviceCategory.description}
                  </p>
                </div>

                <div>
                  <p className="text-xl font-bold text-primary text-end">
                    Cod. {serviceCategory.taxCode}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Tooltip>
        ))}
      </div>

      {serviceCategories.length === 0 && (
        <EmptyState
          icon={Boxes}
          title="Nenhuma categoria de serviço localizada"
          description="Cadastre categorias de serviços e vincule-as a serviços para que possa integrar com sistemas de emissão de Notas Fiscais, bem como agrupá-los por contexto"
        />
      )}
    </div>
  );
};

export default ServiceCategory;
