import { date } from "@/lib/dayjs";
import { getLocale, getTranslations } from "next-intl/server";
import { getUserFooterData } from "../_data/getUserProfileSections";

interface UserProfileFooterProps {
  userId: string;
}

export async function UserProfileFooter({ userId }: UserProfileFooterProps) {
  const [user, t, locale] = await Promise.all([
    getUserFooterData(userId),
    getTranslations("userProfile"),
    getLocale(),
  ]);

  const dateFormat = locale === "pt" ? "DD/MM/YYYY HH:mm" : "MM/DD/YYYY HH:mm";

  return (
    <div className="mt-6 text-center text-sm font-bold space-y-4">
      <p>
        {t("footer.userId")}{" "}
        <code className="border px-2 py-1 rounded text-xs">{user.id}</code>
      </p>
      <p className="mt-1">
        {t("footer.lastUpdate")} {date(user.updatedAt).format(dateFormat)}
      </p>
    </div>
  );
}
