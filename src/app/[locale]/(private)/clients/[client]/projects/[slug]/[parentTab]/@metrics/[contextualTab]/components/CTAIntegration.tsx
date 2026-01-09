"use client";

import { connectProjectToServiceAction } from "@/actions/integrations/connectProjectToServiceAction";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { IntegrationType } from "@/generated/prisma/browser";
import { Link } from "@/i18n/navigation";
import { OrganizationIntegrationWithDetails } from "@/repositories/IOrganizationIntegrationRepository";
import { ListChecks, Settings2 } from "lucide-react"; // Sugestão de ícones de fallback
import { toast } from "sonner";

interface ICTAIntegration {
  client: string;
  projectSlug: string;
  integration: OrganizationIntegrationWithDetails | null;
  integrationType: IntegrationType;
}

const INTEGRATION_HOOKS: Record<string, string> = {
  sonarqube:
    "Reduza o custo de manutenção e elimine bugs antes que cheguem em produção. Monitore sua dívida técnica em tempo real.",
  "umami-analytics":
    "Entenda o comportamento dos seus usuários sem comprometer a privacidade. Dados claros para decisões baseadas em evidências.",
  github:
    "Automatize seu fluxo de trabalho, monitore PRs e acelere sua velocidade de entrega com métricas DORA.",
  defectdojo:
    "Centralize suas vulnerabilidades e mantenha seu projeto seguro e em conformidade com os padrões de segurança.",
  cora: "Automatize suas cobranças e simplifique a gestão financeira do seu projeto.",
};

export function CTAIntegration({
  client,
  projectSlug,
  integration,
  integrationType,
}: ICTAIntegration) {
  const hookMessage =
    INTEGRATION_HOOKS[integrationType.slug as keyof typeof INTEGRATION_HOOKS] ||
    "Potencialize a gestão do seu projeto com dados em tempo real.";

  // ESTADO 1: A Organização ainda não conectou este provedor (Ex: Não colocou o Token Global do Sonar)
  if (!integration) {
    return (
      <EmptyState
        title={integrationType.name}
        description={`${hookMessage} Conecte sua conta global da ${integrationType.name} para liberar este recurso.`}
        image={integrationType.logo || ""}
        action={
          <Link href={`/settings/integrations/config`}>
            <Button type="button" variant="outline">
              <Settings2 className="mr-2 h-4 w-4" />
              Configurar Provedor Global
            </Button>
          </Link>
        }
      />
    );
  }

  const handleConnectServiceToProject = async () => {
    const result = await connectProjectToServiceAction(
      client,
      integration.id,
      projectSlug
    );

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
  };

  return (
    <EmptyState
      title={`${integrationType.name} disponível`}
      description={`${hookMessage} Ative agora para começar a coletar métricas neste projeto.`}
      image={integrationType.logo || ""}
      action={
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={handleConnectServiceToProject}
        >
          <ListChecks className="mr-2 h-4 w-4" />
          Vincular este Projeto
        </Button>
      }
    />
  );
}
