import { UnderConstruction } from "@/components/UnderConstruction";
import { getTranslations } from "next-intl/server";

export default async function PurchaseMetricsPage() {
  const t = await getTranslations("purchase.metrics");

  return <UnderConstruction featureTitle={t("title")} />;
}
