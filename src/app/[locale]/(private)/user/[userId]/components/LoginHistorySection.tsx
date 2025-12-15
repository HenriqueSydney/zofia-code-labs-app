import { formatDate } from "@/utils/dateFormatter";
import { parseUserAgent } from "@/utils/parseUserAgent";
import { History, Globe, Clock } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

// Tipo simplificado baseado no seu Prisma Model
type LoginHistoryItem = {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date | string;
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
    <div className="bg-card rounded-2xl shadow-xl p-8 mb-6 border border">
      {/* Cabeçalho */}
      <div className="flex items-center space-x-3 mb-6">
        <History className="w-6 h-6 text-blue-600" />
        <h3 className="text-2xl font-bold text-primary">
          {t("title") || "Histórico de Acesso"}
        </h3>
      </div>

      <div className="space-y-3">
        {history.map((item) => {
          const device = parseUserAgent(item.userAgent);
          const DeviceIcon = device.icon;

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

                <div>
                  <p className="font-semibold text-foreground">{device.name}</p>

                  {/* Detalhes Mobile (IP e Data juntos) */}
                  <div className="flex sm:hidden items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>{item.ipAddress || "IP Oculto"}</span>
                    <span>•</span>
                    <span>
                      {" "}
                      {formatDate(item.createdAt, locale, formatDateType)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detalhes Desktop (Direita) */}
              <div className="hidden sm:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2" title="Endereço IP">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono">
                    {item.ipAddress || "IP Oculto"}
                  </span>
                </div>

                <div className="flex items-center gap-2" title="Data do Acesso">
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
        {t("footerNote") || "Exibindo os últimos 10 acessos à sua conta."}
      </p>
    </div>
  );
}
