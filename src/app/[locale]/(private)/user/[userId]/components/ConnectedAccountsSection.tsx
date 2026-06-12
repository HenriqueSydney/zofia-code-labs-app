import { formatDate } from "@/utils/dateFormatter";
import { Link2, Trash2, Unplug } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { UserProfileSectionCard } from "./UserProfileSectionCard";

interface IConnectedAccountsSection {
  accounts: {
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
  }[];
}

export async function ConnectedAccountsSection({
  accounts,
}: IConnectedAccountsSection) {
  const [t, locale] = await Promise.all([
    getTranslations("userProfile"),
    getLocale(),
  ]);

  const getProviderIcon = (provider: string) => {
    const icons = {
      google: "🔵",
      github: "⚫",
      facebook: "🔷",
      twitter: "🐦",
    } as const;

    return icons[provider as keyof typeof icons] || "🔗";
  };

  return (
    <UserProfileSectionCard
      title={t("connectedAccounts.title")}
      icon={<Link2 className="w-6 h-6 text-blue-600" />}
      collapsible
    >
      <div className="space-y-3">
        {/* Verificação se o array está vazio */}
        {accounts.length === 0 ? (
          <div className="bg-background/50 flex flex-col items-center justify-center p-8 rounded-xl border border-dashed text-center">
            <div className="p-3 rounded-full bg-muted/50 mb-3">
              <Unplug className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              {t("connectedAccounts.noAccounts")}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {t("connectedAccounts.noAccountsDesc")}
            </p>
          </div>
        ) : (
          accounts.map((account, idx) => (
            <div
              key={idx}
              className="bg-background/70 flex items-center justify-between p-4 rounded-xl border hover:shadow-glow transition-colors"
            >
              <div className="flex items-center space-x-4">
                <span className="text-2xl">
                  {getProviderIcon(account.provider)}
                </span>
                <div>
                  <p className="font-semibold capitalize">{account.provider}</p>
                  <p className="text-sm text-slate-600">
                    {t("connectedAccounts.connectedOn")}{" "}
                    {formatDate(account.createdAt, locale)}
                  </p>
                </div>
              </div>
              <button className="text-red-600 hover:text-red-700 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </UserProfileSectionCard>
  );
}
