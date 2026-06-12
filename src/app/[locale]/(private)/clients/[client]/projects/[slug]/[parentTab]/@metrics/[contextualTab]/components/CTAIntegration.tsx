"use client";

import { connectProjectToServiceAction } from "@/actions/integrations/connectProjectToServiceAction";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { IntegrationType } from "@/generated/prisma/browser";
import { Link } from "@/i18n/navigation";
import { OrganizationIntegrationWithDetails } from "@/repositories/IOrganizationIntegrationRepository";
import { ListChecks, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useState } from "react";
import { GitHubIntegrationForm } from "./GitHubIntegrationForm";

interface ICTAIntegration {
  client: string;
  projectSlug: string;
  integration: OrganizationIntegrationWithDetails | null;
  integrationType: IntegrationType;
}

const HOOK_KEYS: Record<string, string> = {
  sonarqube: "sonarqube",
  "umami-analytics": "umamiAnalytics",
  github: "github",
  defectdojo: "defectdojo",
  cora: "cora",
};

export function CTAIntegration({
  client,
  projectSlug,
  integration,
  integrationType,
}: ICTAIntegration) {
  const t = useTranslations("projects.metrics.integrations");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hookKey = HOOK_KEYS[integrationType.slug] ?? "default";
  const hookMessage = t(`hooks.${hookKey}` as never);

  // ESTADO 1: A Organização ainda não conectou este provedor (Ex: Não colocou o Token Global do Sonar)
  if (!integration) {
    return (
      <EmptyState
        title={integrationType.name}
        description={t("cta.connectGlobalDescription", {
          hook: hookMessage,
          name: integrationType.name,
        })}
        image={integrationType.logo || ""}
        action={
          <Link href={`/settings/integrations/config`}>
            <Button type="button" variant="outline">
              <Settings2 className="mr-2 h-4 w-4" />
              {t("cta.configureGlobalProvider")}
            </Button>
          </Link>
        }
      />
    );
  }

  const handleToggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleConnectServiceToProject = async (data: any) => {
    const result = await connectProjectToServiceAction(
      client,
      integration.id,
      projectSlug,
      data,
    );

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
  };

  return (
    <>
      <EmptyState
        title={t("cta.availableTitle", { name: integrationType.name })}
        description={t("cta.activateProjectDescription", { hook: hookMessage })}
        image={integrationType.logo || ""}
        action={
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => setIsModalOpen(true)}
          >
            <ListChecks className="mr-2 h-4 w-4" />
            {t("cta.linkProject")}
          </Button>
        }
      />
      <GitHubIntegrationForm
        handleConnectServiceToProject={handleConnectServiceToProject}
        isModalOpen={isModalOpen}
        setIsModalOpen={handleToggleModal}
        projectSlug={projectSlug}
      />
    </>
  );
}
