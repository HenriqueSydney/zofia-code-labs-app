import { UnderConstruction } from "@/components/UnderConstruction";
import { getTranslations } from "next-intl/server";

export default async function PurchaseAnalyticsPage() {
  const t = await getTranslations("purchase.analytics");

  return <UnderConstruction featureTitle={t("title")} />;
}
