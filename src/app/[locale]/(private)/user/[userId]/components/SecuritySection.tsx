import { Suspense } from "react";
import { Key, Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { getTranslations } from "next-intl/server";
import { cn } from "@/utils/twMerge";
import { UserProfileSectionCard } from "./UserProfileSectionCard";
import { Button } from "@/components/ui/button";

interface ISecuritySection {
  user: {
    hasPassword: boolean;
  };
  invitePasswordSetup?: boolean;
}

export async function SecuritySection({
  user,
  invitePasswordSetup = false,
}: ISecuritySection) {
  const t = await getTranslations("userProfile");
  return (
    <UserProfileSectionCard
      title={t("security.title")}
      icon={<Lock className="w-6 h-6 text-blue-600" />}
      collapsible
    >
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
                  ? t("security.passwordSet")
                  : t("security.noPassword")}
              </p>
              <p className="text-sm text-slate-600">
                {user.hasPassword && t("security.active")}

                {!user.hasPassword && t("security.authViaSocial")}
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <Button variant="outline" disabled className="gap-2">
                <Key className="w-4 h-4" />
                {t("security.changePassword")}
              </Button>
            }
          >
            <ChangePasswordForm invitePasswordSetup={invitePasswordSetup} />
          </Suspense>
        </div>
      </div>
    </UserProfileSectionCard>
  );
}
