import { auth } from "@/auth";
import { AppError } from "@/errors/AppError";
import { date } from "@/lib/dayjs";
import { repositoryClient } from "@/lib/repositoryClient";
import { getLocale, getTranslations } from "next-intl/server";
import { OrganizationInfo } from "@/components/OrganizationInfo";
import { LoginHistorySection } from "./components/LoginHistorySection";
import { ConnectedAccountsSection } from "./components/ConnectedAccountsSection";
import { MainProfileCard } from "./components/MainProfileCard";
import { SecuritySection } from "./components/SecuritySection";
import { getUserInfoAction } from "@/actions/users/getUserInfoAction";
import { operationWrapper } from "@/lib/operationWrapper";
import { UserWithAllInfo } from "@/repositories/IUsersRepository";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const [operatiorSession, t, locale] = await Promise.all([
    auth(),
    getTranslations("userProfile"),
    getLocale(),
  ]);

  const dateFormat = locale === "pt" ? "DD/MM/YYYY HH:mm" : "MM/DD/YYYY HH:mm";
  if (!operatiorSession) {
    throw new AppError(t("errors.mustBeLoggedIn"));
  }

  if (
    operatiorSession.user.id !== userId &&
    operatiorSession.user.role !== "OWNER" &&
    operatiorSession.user.role !== "TENANT_ADMIN"
  ) {
    throw new AppError(t("errors.unauthorizedAccess"));
  }

  const [userError, userSuccess] = await operationWrapper<{
    success: boolean;
    data: UserWithAllInfo | null;
  }>("action", "getUserInfoAction", () => getUserInfoAction(userId), {
    cache: "no-cache",
  });

  if (userError) {
    throw new AppError(t("errors.userNotFound"));
  }

  if (!userSuccess) {
    throw new AppError(t("errors.userNotFound"));
  }

  if (!userSuccess.data) {
    throw new AppError(t("errors.userNotFound"));
  }

  const formatDate = (dateString: Date) => {
    if (!dateString) return t("placeholders.notAvailable");
    return date(dateString).format(dateFormat);
  };

  const isSameUser = operatiorSession.user.id === userId;
  const user = userSuccess.data;

  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        {!isSameUser && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
          </div>
        )}

        {isSameUser && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t("myProfile")}</h1>
            <p className="text-slate-600">{t("description")}</p>
          </div>
        )}

        {/* Main Profile */}
        <MainProfileCard user={user} />
        {/* Organization Info */}
        <OrganizationInfo organization={user.organization} />
        {/* Security / Password Section */}
        <SecuritySection user={user} />
        {/* Connected Accounts */}
        <ConnectedAccountsSection accounts={user.accounts} />
        {/* Login Histories */}
        <LoginHistorySection history={user.loginHistories} />

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm font-bold space-y-4">
          <p>
            {t("footer.userId")}{" "}
            <code className="border px-2 py-1 rounded text-xs">{user.id}</code>
          </p>
          <p className="mt-1">
            {t("footer.lastUpdate")} {formatDate(user.updatedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
