import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@/generated/prisma/client";
import { mask } from "@/utils/mask";
import { Mail, MapPin, Phone, Settings } from "lucide-react";
import { getTranslations } from "next-intl/server";

type ClientInstitutionalInfoProps = Pick<
  Client,
  "companyName" | "tradeName" | "cnpj" | "phone" | "email" | "address"
>;

export async function ClientInstitutionalInfo({
  companyName,
  tradeName,
  cnpj,
  phone,
  email,
  address,
}: ClientInstitutionalInfoProps) {
  const t = await getTranslations("clients.form");
  const tInstitutional = await getTranslations("clients.institutional");
  const tCommon = await getTranslations("common");

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          {tInstitutional("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              {t("companyName")}
            </label>
            <p className="font-medium">{companyName}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              {t("tradeName")}
            </label>
            <p className="font-medium">{tradeName}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              {t("cnpj")}
            </label>
            <p className="font-medium">
              {cnpj.includes(".")
                ? cnpj
                : mask(cnpj, "##.###.###/####-##")}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-md">
              <Phone size={16} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                {t("phone")}
              </label>
              <p className="font-medium">{phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-md">
              <Mail size={16} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                {t("email")}
              </label>
              <p className="font-medium">{email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-md">
              <MapPin size={16} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                {tInstitutional("address")}
              </label>
              <p className="font-medium text-sm">
                {address || tCommon("notInformed")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
