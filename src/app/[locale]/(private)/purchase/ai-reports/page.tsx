import { UnderConstruction } from "@/components/UnderConstruction";
import { getTranslations } from "next-intl/server";

export default async function PurchaseAiReportsPage() {
  const t = await getTranslations("purchase.aiReports");

  return <UnderConstruction featureTitle={t("title")} />;
}
