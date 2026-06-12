import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { SectionHeading } from "@/components/SectionHeading";
import { QueryFilter } from "@/components/QueryFilter";
import { CreateIntegrationTypeForm } from "./components/CreateIntegrationTypeForm";
import { getParams } from "@/utils/getParams";
import { operationWrapper } from "@/lib/operationWrapper";
import { listIntegrationTypesAction } from "@/actions/integrations/listIntegrationTypesAction";
import { ValidationError } from "@/errors";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IntegrationTypeRemoveOrEdit } from "./components/IntegrationTypeRemoveOrEdit";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Role } from "@/generated/prisma/client";

interface IParams {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
}
const Integrations = async ({ searchParams }: IParams) => {
  const { query } = await getParams(searchParams, ["query"]);

  const [[error, success], t, session] = await Promise.all([
    operationWrapper(
      "action",
      "listIntegrationTypesAction",
      () => {
        return listIntegrationTypesAction(query);
      },
      {
        cache: "no-cache",
      },
    ),
    getTranslations("settings.integrations.catalog"),
    auth(),
  ]);

  const canManage = session?.user?.role === Role.OWNER;

  if (error) {
    throw new ValidationError(t("errors.listFailed"));
  }

  const integrations = success.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeading
          title={t("page.title")}
          description={t("page.description")}
        />
        {canManage && <CreateIntegrationTypeForm />}
      </div>

      <QueryFilter placeholder={t("search")} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => {
          return (
            <Card
              key={integration.id}
              className="group border-border/60 hover:border-primary/50 hover:shadow-md transition-all duration-300"
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative min-w-12 min-h-12 max-w-12 max-h-12 p-0.5 rounded-xl bg-white border border-border">
                      <Image
                        src={integration.logo ?? "/zofia-logo.webp"}
                        alt={integration.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-bold">
                          {integration.name}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono uppercase tracking-tighter bg-muted/30"
                        >
                          {integration.slug}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2 mt-1 text-xs leading-relaxed">
                        {integration.description ?? t("card.noDescription")}
                      </CardDescription>
                    </div>
                  </div>
                  {canManage && (
                    <IntegrationTypeRemoveOrEdit integration={integration} />
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <span className="text-[10px] text-muted-foreground italic">
                    ID: {integration.id}
                  </span>
                  {integration.externalDocsUrl && (
                    <Link href={integration.externalDocsUrl} target="_blank">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-primary"
                      >
                        {t("card.viewDocs")}{" "}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Integrations;
