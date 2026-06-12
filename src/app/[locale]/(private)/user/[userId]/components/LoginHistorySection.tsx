import { formatDate } from "@/utils/dateFormatter";
import { parseUserAgent } from "@/utils/parseUserAgent";
import { History, Globe, Clock } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { UserProfileSectionCard } from "./UserProfileSectionCard";

// Tipo simplificado baseado no seu Prisma Model
type LoginHistoryItem = {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date | string;
  city: string | null;
  country: string | null;
  region: string | null;
};

interface LoginHistorySectionProps {
  history: LoginHistoryItem[];
}

export async function LoginHistorySection({
  history,
}: LoginHistorySectionProps) {
  const [t, locale] = await Promise.all([
    getTranslations("userProfile.LoginHistory"),
    getLocale(),
  ]);

  if (!history || history.length === 0) return null;

  const formatDateType: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return (
    <UserProfileSectionCard
      title={t("title")}
      icon={<History className="w-6 h-6 text-blue-600" />}
      collapsible
    >
      <div className="space-y-3">
        {history.map((item) => {
          const device = parseUserAgent(item.userAgent);
          const DeviceIcon = device.icon;
          let ipAddress = item.ipAddress || t("ipAddress");
          if (ipAddress === "::1") {
            ipAddress = t("localhost");
          }
          let city = item.city;
          let country = item.country;
          let region = item.region;

          return (
            <div
              key={item.id}
              className="bg-background/70 flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border hover:shadow-glow transition-colors gap-4"
            >
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                {/* Ícone do Dispositivo */}
                <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <DeviceIcon className="w-5 h-5" />
                </div>

                <div className="w-full">
                  <p className="font-semibold text-foreground">{device.name}</p>

                  {/* Detalhes Mobile (IP e Data juntos) */}
                  <div className="w-full flex sm:hidden items-center justify-between gap-2 text-xs text-slate-500 mt-1">
                    <div className="flex flex-col items-start">
                      <span>{ipAddress} </span>
                      <span>
                        {ipAddress === t("localhost")
                          ? ""
                          : `(${region}, ${country})`}
                      </span>
                    </div>
                    <span>•</span>
                    <span>
                      {" "}
                      {formatDate(item.createdAt, locale, formatDateType)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detalhes Desktop (Direita) */}
              <div className="hidden sm:flex sm:flex-col items-end text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2" title={t("ipAddressTitle")}>
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono">
                    {ipAddress}{" "}
                    {ipAddress === t("localhost")
                      ? ""
                      : `(${city}, ${region}, ${country})`}
                  </span>
                </div>

                <div className="flex items-center gap-2" title={t("accessDateTitle")}>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {" "}
                    {formatDate(item.createdAt, locale, formatDateType)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        {t("footerNote")}
      </p>
    </UserProfileSectionCard>
  );
}
