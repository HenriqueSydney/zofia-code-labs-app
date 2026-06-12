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
import { getTranslations } from "next-intl/server";

interface IStatsCardContainer {
  slug: string;
}

export async function StatsCardContainer({ slug }: IStatsCardContainer) {
  const t = await getTranslations("clients.dashboard.stats");
  const data = await getCachedClientStats(slug);

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatsCard
        label={t("activeProjects")}
        mainInformation={data.activeProjects}
        Icon={LayoutDashboard}
      />
      <StatsCard
        label={t("maintenance")}
        mainInformation={data.maintenanceProjects}
        Icon={Wrench}
      />
      <StatsCard
        label={t("pendingActions")}
        mainInformation={data.pendingActions}
        Icon={ListChecks}
      />
      <StatsCard
        label={t("overdueInvoices")}
        mainInformation={data.overdueInvoices}
        Icon={AlertTriangle}
      />
      <StatsCard
        label={t("nextDelivery")}
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
