import { OrganizationInfo } from "@/components/OrganizationInfo";
import { getUserOrganization } from "../_data/getUserProfileSections";

interface OrganizationInfoSectionProps {
  userId: string;
}

export async function OrganizationInfoSection({
  userId,
}: OrganizationInfoSectionProps) {
  const organization = await getUserOrganization(userId);
  return <OrganizationInfo organization={organization} />;
}
