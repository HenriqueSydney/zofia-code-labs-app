import { operationWrapper } from "@/lib/operationWrapper";
import { AppError } from "@/errors/AppError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import {
  Building2,
  Globe,
  Fingerprint,
  MapPin,
  BarChart3,
  Activity,
} from "lucide-react";
import { mask } from "@/utils/mask";
import { Badge } from "@/components/ui/badge";
import { getOrganizationAction } from "@/actions/organization/getOrganizationAction";
import { date } from "@/lib/dayjs";

interface IOrganizationPage {
  params: Promise<{ organization: string }>;
}

export default async function OrganizationPage({ params }: IOrganizationPage) {
  const { organization } = await params;

  // Reutiliza a action (Next.js faz dedupe automático do request se for fetch,
  // mas com Prisma direto é bom garantir cache ou aceitar a segunda query leve)
  const [error, success] = await operationWrapper(
    "action",
    "getOrganization",
    () => getOrganizationAction({ organizationId: organization }),
  );

  if (error) {
    throw new AppError(error.message);
  }

  const org = success.organization;

  return (
    <TabsContent value="overview" className="space-y-6 outline-none m-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal: Dados Cadastrais */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Dados da Organização
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-y-6 gap-x-8">
            <div className="space-y-4">
              <div className="group">
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
                  Nome da Empresa
                </label>
                <p className="font-medium text-base">{org.name}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
                  <Globe className="w-3 h-3" /> Slug (URL)
                </label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">
                    {org.slug}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
                  Segmento
                </label>
                <p className="font-medium">{org.industry.replace(/_/g, " ")}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
                  <Fingerprint className="w-3 h-3" /> CNPJ
                </label>
                <p className="font-medium">
                  {org.cnpj?.includes("/")
                    ? org.cnpj
                    : mask(
                        org.cnpj || "##.###.###/####-##",
                        "##.###.###/####-##",
                      )}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
                  <CalendarDaysIcon className="w-3 h-3" /> Data de Criação
                </label>
                <p className="font-medium">
                  {date(org.createdAt).format("DD/MM/YYYY HH:mm")}
                </p>
              </div>

              {/* Exemplo de campo de Settings (JSON) se houver endereço */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3" /> Localização
                </label>
                <p className="font-medium text-muted-foreground italic">
                  Brasília, DF{" "}
                  {/* Placeholder ou vindo de org.settings.address */}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coluna Lateral: Resumo de Uso/Saúde da Conta */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Status da Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-sm text-muted-foreground">
                  Consumo de Recursos
                </span>
                <span className="text-xl font-bold text-primary">75%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[75%]" />
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plano</span>
                  <span className="font-medium">Business Pro</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Próxima Fatura</span>
                  <span>15/03/2026</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Membros</span>
                  <span>{org.totalOfMembers} / 20</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 shadow-none">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-background rounded-full border shadow-sm">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">ZofIA Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Sua organização completou 5 projetos este mês. A
                    produtividade aumentou 12%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
}

function CalendarDaysIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  );
}
