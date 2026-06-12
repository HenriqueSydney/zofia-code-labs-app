import { getMainProfileData } from "../_data/getUserProfileSections";
import { MainProfileCard } from "./MainProfileCard";

interface MainProfileCardSectionProps {
  userId: string;
  canEdit?: boolean;
}

export async function MainProfileCardSection({
  userId,
  canEdit = false,
}: MainProfileCardSectionProps) {
  const user = await getMainProfileData(userId);
  return <MainProfileCard user={user} canEdit={canEdit} />;
}
