import {
  Building2,
  CalendarDays,
  CreditCard,
  ShieldCheck,
  Users,
} from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading"; // Assumindo existência
import { StatsCard } from "@/components/StatsCard"; // Assumindo existência
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { operationWrapper } from "@/lib/operationWrapper";
import { AppError } from "@/errors/AppError";
import { Button } from "@/components/ui/button";
import { OrganizationTabs } from "./_components/OrganizationTabs";
import { GoBackButton } from "@/components/GoBackButton"; // Assumindo existência
import { mask } from "@/utils/mask";
import { getOrganizationAction } from "@/actions/organization/getOrganizationAction"; // Criar esta action
import { date } from "@/lib/dayjs";
import { Link } from "@/i18n/navigation";

interface IOrganizationLayout {
  children: React.ReactNode;
  params: Promise<{ organization: string }>;
}

export default async function OrganizationLayout({
  children,
  params,
}: IOrganizationLayout) {
  const { organization } = await params;

  // Busca a organização (incluindo contagem de users, projects, roles)
  const [error, success] = await operationWrapper(
    "action",
    "getOrganization",
    () => getOrganizationAction({ organizationId: organization }),
  );

  if (error) {
    throw new AppError(error.message);
  }

  const org = success.organization;

  // Fallback para iniciais
  const initials = org.name
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Formatação do Industry Type (Enum para Texto legível)
  const industryLabel = org.industry
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l: string) => l.toUpperCase());

  return (
    <div className="space-y-6 mb-10">
      {/* Header com Logo e Ações */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-5 items-center">
            <GoBackButton withLabel={false} />

            <Avatar className="h-20 w-20 rounded-xl border-2 border-muted shadow-sm">
              {/* Se tiver logo no futuro, adicionar aqui */}
              <AvatarImage src={""} alt={org.name} />
              <AvatarFallback className="rounded-xl bg-primary/5 text-primary text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <SectionHeading
                title={org.name}
                description={org.slug} // ou industryLabel
                marginBottom="mb-1"
              />
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                {org.cnpj && (
                  <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md text-xs">
                    <Building2 size={12} />
                    {org.cnpj.includes("/")
                      ? org.cnpj
                      : mask(org.cnpj, "##.###.###/####-##")}
                  </span>
                )}
                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md text-xs">
                  <CalendarDays size={12} />
                  Desde {date(org.createdAt).year()}
                </span>
                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md text-xs">
                  <Building2 size={12} />
                  {industryLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Resumo (Stats) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Membros Ativos"
            mainInformation={String(org.totalOfMembers || 0)}
            Icon={Users}
            description="Usuários na plataforma"
          />
          <StatsCard
            label="Perfis Customizados"
            mainInformation={String(org.totalOfCustomRoles || 0)}
            Icon={ShieldCheck}
            iconColor="bg-purple-500/10 text-purple-600"
            description="Cargos definidos"
          />
          <StatsCard
            label="Projetos"
            mainInformation={String(org.totalOfProjects || 0)}
            Icon={Building2} // Ou ProjectIcon
            iconColor="bg-blue-500/10 text-blue-600"
          />
          <StatsCard
            label="Plano Atual"
            mainInformation="Enterprise" // Placeholder ou vindo do banco
            Icon={CreditCard}
            iconColor="bg-green-500/10 text-green-600"
            description="Renova em 10 dias"
          />
        </div>
      </div>

      {/* Navegação por Tabs */}
      <OrganizationTabs>
        <div className="mt-6 animate-in fade-in-50 duration-300">
          {children}
        </div>
      </OrganizationTabs>
    </div>
  );
}
