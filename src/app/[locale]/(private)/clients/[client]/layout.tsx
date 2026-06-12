import {
  Building2,
  FileText,
  LayoutDashboard,
  Mail,
  PieChart,
  Presentation,
} from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { StatsCard } from "@/components/StatsCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClientTabs } from "./_components/ClientTabs";
import { EditClientForm } from "./_components/EditClientForm";
import { Button } from "@/components/ui/button";
import { ClientHeaderWrapper } from "./_components/ClientHeaderWrapper";
import { GoBackButton } from "@/components/GoBackButton";
import { mask } from "@/utils/mask";
import { assertClientRouteAccess } from "../_data/assertClientRouteAccess";
import { getClientData } from "../_data/getClientData";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { hasPermission } from "@/utils/hasPermission";
import { PERMISSIONS } from "@/constants/permissions";

interface IClientLayout {
  children: React.ReactNode;
  params: Promise<{ client: string }>;
}

export default async function ClientLayout({
  children,
  params,
}: IClientLayout) {
  const { client: slug } = await params;

  await assertClientRouteAccess(slug);

  const [client, tLayout, tStats, session] = await Promise.all([
    getClientData(slug),
    getTranslations("clients.layout"),
    getTranslations("clients.dashboard.stats"),
    auth(),
  ]);

  const canUpdate = hasPermission(session?.user, PERMISSIONS.CLIENT.UPDATE);

  return (
    <div className="space-y-6 mb-10">
      {/* Header com Logo e Ações */}
      <ClientHeaderWrapper>
        <div className="flex items-center justify-between">
          <div className="flex gap-5 items-start">
            <GoBackButton withLabel={false} className="mt-2" />
            <Avatar className="h-20 w-20 rounded-lg border-2 border-muted">
              <AvatarImage
                src={client.logoReference || ""}
                alt={client.tradeName}
              />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                <Building2 size={32} />
              </AvatarFallback>
            </Avatar>
            <div>
              <SectionHeading
                title={client.tradeName}
                description={client.companyName}
                marginBottom="mb-2"
              />
              <div className="flex gap-4  text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 size={14} />{" "}
                  {client.cnpj.includes(".")
                    ? client.cnpj
                    : mask(client.cnpj, "##.###.###/####-##")}
                </span>
                <span className="flex items-center gap-1">
                  <Mail size={14} /> {client.email}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              {tLayout("contact")}
            </Button>

            {canUpdate && <EditClientForm client={client} />}
          </div>
        </div>

        {/* Cards de Resumo (Stats) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label={tStats("activeProjects")}
            mainInformation={client.stats.activeProjects}
            Icon={LayoutDashboard}
          />
          <StatsCard
            label={tStats("totalInContracts")}
            mainInformation={client.stats.totalInContracts}
            Icon={FileText}
            iconColor="bg-blue-500/10"
          />
          <StatsCard
            label={tStats("openInvoices")}
            mainInformation={client.stats.openInvoices}
            Icon={PieChart}
            iconColor="bg-orange-500/10"
          />
          <StatsCard
            label={tStats("tenure")}
            mainInformation={client.stats.tenure}
            Icon={Presentation}
            iconColor="bg-green-500/10"
          />
        </div>
      </ClientHeaderWrapper>
      {/* Estrutura de Tabs */}
      <ClientTabs>
        <div className="mt-6">{children}</div>
      </ClientTabs>
    </div>
  );
}
