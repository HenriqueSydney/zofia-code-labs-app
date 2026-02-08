import { StatsCard } from "@/components/StatsCard";
import {
  LayoutDashboard,
  ListChecks,
  Flag,
  AlertTriangle,
  Wrench,
} from "lucide-react";
import { getCachedClientStats } from "../_data/get-cached-client-stats";
import { date } from "@/lib/dayjs";

interface IStatsCardContainer {
  slug: string;
}

export async function StatsCardContainer({ slug }: IStatsCardContainer) {
  const data = await getCachedClientStats(slug);

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatsCard
        label="Projetos Ativos"
        mainInformation={data.activeProjects}
        Icon={LayoutDashboard}
      />
      <StatsCard
        label="Manutenção & Suporte"
        mainInformation={data.maintenanceProjects}
        Icon={Wrench}
      />
      <StatsCard
        label="Ações Pendentes"
        mainInformation={data.pendingActions}
        Icon={ListChecks}
      />
      <StatsCard
        label="Cobranças em Atraso"
        mainInformation={data.overdueInvoices}
        Icon={AlertTriangle}
      />
      <StatsCard
        label="Próxima Entrega"
        mainInformation={
          data.nextDeliveryDate
            ? date(data.nextDeliveryDate).format("DD/MM/YYYY")
            : "---"
        }
        Icon={Flag}
      />
    </div>
  );
}
