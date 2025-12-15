import { Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { getTranslations } from "next-intl/server";
import { cn } from "@/utils/twMerge";

interface ISecuritySection {
  user: {
    hasPassword: boolean;
  };
}

export async function SecuritySection({ user }: ISecuritySection) {
  const t = await getTranslations("userProfile");
  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 mb-6 border border">
      <div className="flex items-center space-x-3 mb-6">
        <Lock className="w-6 h-6 text-blue-600" />
        <h3 className="text-2xl font-bold text-primary">
          {t("security.title") || "Segurança"}
        </h3>
      </div>

      <div className="space-y-3">
        <div className="bg-background/70 flex items-center justify-between p-4 rounded-xl border hover:shadow-glow transition-colors">
          <div className="flex items-center space-x-4">
            <div
              className={cn(
                "p-2 rounded-full",
                user.hasPassword &&
                  "bg-green-100 dark:bg-green-900/30 text-green-600",
                !user.hasPassword &&
                  "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600"
              )}
            >
              {user.hasPassword ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>

            <div>
              <p className="font-semibold">
                {user.hasPassword
                  ? t("security.passwordSet") || "Senha de acesso"
                  : t("security.noPassword") || "Senha não configurada"}
              </p>
              <p className="text-sm text-slate-600">
                {/* t("security.lastChanged", { date: "há 3 meses" })) || */}
                {user.hasPassword && "Segurança ativa"}

                {!user.hasPassword &&
                  (t("security.authViaSocial") ||
                    "Você utiliza login social. Crie uma senha para acesso direto.")}
              </p>
            </div>
          </div>

          {/* Botão de Ação */}
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
