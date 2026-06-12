import { INVITE_PASSWORD_SETUP_COOKIE } from "@/constants/orgInvite";
import { cookies } from "next/headers";
import { getUserSecurityData } from "../_data/getUserProfileSections";
import { SecuritySection } from "./SecuritySection";

interface SecuritySectionContainerProps {
  userId: string;
}

export async function SecuritySectionContainer({
  userId,
}: SecuritySectionContainerProps) {
  const [user, cookieStore] = await Promise.all([
    getUserSecurityData(userId),
    cookies(),
  ]);

  const invitePasswordSetup =
    cookieStore.get(INVITE_PASSWORD_SETUP_COOKIE)?.value === userId;

  return (
    <SecuritySection user={user} invitePasswordSetup={invitePasswordSetup} />
  );
}
