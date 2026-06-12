import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions";
import { Link } from "@/i18n/navigation";
import { ProjectWithDetails } from "@/repositories/IProjectsRepository";
import { hasPermission } from "@/utils/hasPermission";
import { Pencil } from "lucide-react";
import { getTranslations } from "next-intl/server";

interface IProjectSummary {
  project: ProjectWithDetails;
}

export async function ProjectSummary({ project }: IProjectSummary) {
  const [session, t] = await Promise.all([
    auth(),
    getTranslations("projects.overview.summary"),
  ]);
  const canManage = hasPermission(session?.user, PERMISSIONS.PROJECT.UPDATE);

  return (
    <Card className="lg:col-span-2 h-full min-h-[400px] max-h-[400px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("title")}</CardTitle>
        {canManage && (
          <Link
            href={`/clients/${project.client.slug}/projects/${project.slug}/form`}
          >
            <Button variant="ghost">
              <Pencil className="w-4 h-4" />
              {t("editSummary")}
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent className="overflow-y-auto space-y-6">
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {project.description}
        </p>
        {project.projectServices.length > 0 && (
          <>
            <hr />
            <p className="font-medium">{t("associatedServices")}</p>
            <ul className="ml-10 list-disc text-muted-foreground">
              {project.projectServices.map((service) => (
                <li key={service.serviceTypeId}>{service.serviceType.name}</li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
