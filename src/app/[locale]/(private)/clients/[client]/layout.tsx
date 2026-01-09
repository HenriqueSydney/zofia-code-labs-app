import {
  ArrowLeft,
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
import { operationWrapper } from "@/lib/operationWrapper";
import { getClientAction } from "@/actions/clients/getClientAction";
import { AppError } from "@/errors/AppError";
import { ClientTabs } from "./_components/ClientTabs";
import { EditClientForm } from "./_components/EditClientForm";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ClientHeaderWrapper } from "./_components/ClientHeaderWrapper";

interface IClientLayout {
  children: React.ReactNode;
  params: Promise<{ client: string }>;
}

export default async function ClientLayout({
  children,
  params,
}: IClientLayout) {
  const { client: slug } = await params;

  const [error, success] = await operationWrapper("action", "getClient", () =>
    getClientAction(slug)
  );

  if (error) {
    throw new AppError(error.message);
  }

  const client = success.client;

  return (
    <div className="space-y-6 mb-10">
      {/* Header com Logo e Ações */}
      <ClientHeaderWrapper>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/clients">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
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
                  <Building2 size={14} /> {client.cnpj}
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
              Contatar
            </Button>

            <EditClientForm client={client} />
          </div>
        </div>

        {/* Cards de Resumo (Stats) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Projetos Ativos"
            mainInformation="05"
            Icon={LayoutDashboard}
          />
          <StatsCard
            label="Total em Contratos"
            mainInformation="R$ 450.000,00"
            Icon={FileText}
            iconColor="bg-blue-500/10"
          />
          <StatsCard
            label="Faturas em Aberto"
            mainInformation="02"
            Icon={PieChart}
            iconColor="bg-orange-500/10"
          />
          <StatsCard
            label="Tempo de Casa"
            mainInformation="1.2 anos"
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
