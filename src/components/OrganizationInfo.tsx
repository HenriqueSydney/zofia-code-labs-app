import {
  Building2,
  Settings2,
  Briefcase,
  Hash,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Organization = {
  id: string;
  name: string;
  slug: string;
  cnpj: string | null;
  industry: string;
  createdAt: Date | string;
};

interface OrganizationInfoProps {
  organization: Organization | null;
}

export function OrganizationInfo({ organization }: OrganizationInfoProps) {
  const t = useTranslations("organization");

  // Formatação de data segura
  const formattedDate = organization
    ? new Date(organization.createdAt).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 mb-6 border border">
      {/* Cabeçalho da Seção */}
      <div className="flex items-center space-x-3 mb-6">
        <Building2 className="w-6 h-6 text-blue-600" />
        <h3 className="text-2xl font-bold text-primary">
          {t("title")}
        </h3>
      </div>

      <div className="space-y-3">
        {/* Caso: Usuário SEM organização */}
        {!organization && (
          <div className="bg-background/70 flex flex-col md:flex-row items-center justify-between p-6 rounded-xl border hover:shadow-glow transition-colors gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {t("noOrgTitle")}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("noOrgDesc")}
                </p>
              </div>
            </div>
            <Button variant="default">
              {t("createOrg")}
            </Button>
          </div>
        )}

        {/* Caso: Usuário COM organização */}
        {organization && (
          <>
            {/* Item 1: Identificação Principal */}
            <div className="bg-background/70 flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border hover:shadow-glow transition-colors gap-4">
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                  <Building2 className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-lg">{organization.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {t("statusActive")}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Slug: <span className="font-mono">{organization.slug}</span>
                  </p>
                </div>
              </div>

              <Link href={`/organization/${organization.id}`}>
                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                  <Settings2 className="w-4 h-4" />
                  {t("manage")}
                </Button>
              </Link>
            </div>

            {/* Item 2: Detalhes Técnicos (Grid interna) */}
            <div className="bg-background/70 p-4 rounded-xl border hover:shadow-glow transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CNPJ */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <Hash className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">
                      CNPJ
                    </p>
                    <p className="text-sm font-medium">{organization.cnpj}</p>
                  </div>
                </div>

                {/* Indústria */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">
                      {t("industryLabel")}
                    </p>
                    <p className="text-sm font-medium capitalize">
                      {organization.industry.replace("_", " ").toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* Data */}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">
                      {t("memberSince")}
                    </p>
                    <p className="text-sm font-medium">{formattedDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
