import { UserAvatar } from "@/components/UserAvatar";
import { formatDate } from "@/utils/dateFormatter";
import { Calendar, Mail, Shield } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { AvatarForm } from "./AvatarForm";
import { Role } from "@/generated/prisma/enums";

interface IMainProfileCard {
  user: {
    name: string | null;
    image: string | null;
    role: Role;
    email: string;
    createdAt: Date | string;
    emailVerified: Date | string | null;
  };
}

export async function MainProfileCard({ user }: IMainProfileCard) {
  const [t, locale] = await Promise.all([
    getTranslations("userProfile"),
    getLocale(),
  ]);

  const formatDateType: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return (
    <div className="bg-card rounded-2xl shadow-xl overflow-hidden mb-6 border border">
      <div className="bg-hero-gradient h-32"></div>
      <div className="px-8 pb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-14 mb-6">
          <div className="flex items-end space-x-4">
            <div className="relative">
              <UserAvatar userName={user.name} image={user.image} />
              <AvatarForm />
            </div>

            <div className="pb-2">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-bold text-primary">
                  {user.name || t("placeholders.user")}
                </h2>
                {user.role === "OWNER" && (
                  <span className="bg-hero-gradient text-white font-bold text-xs px-3 py-1 rounded-full">
                    {t("roles.admin")}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground flex items-center mt-1">
                <Mail className="w-4 h-4 mr-1" />
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-background/50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold">
                {t("infoCards.memberSince")}
              </span>
            </div>
            <p className="text-muted-foreground font-medium">
              {formatDate(user.createdAt, locale, formatDateType)}
            </p>
          </div>

          <div className="bg-background/50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold">
                {t("infoCards.emailVerified")}
              </span>
            </div>
            <p className="text-muted-foreground font-medium">
              {user.emailVerified
                ? formatDate(user.emailVerified, locale, formatDateType)
                : t("infoCards.notVerified")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
