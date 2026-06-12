import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client } from "@/generated/prisma/client";
import { Mail, Phone, User } from "lucide-react";
import { getTranslations } from "next-intl/server";

type ClientLegalResponsibleProps = Pick<
  Client,
  "responsibleName" | "responsibleEmail" | "responsiblePhone"
>;

export async function ClientLegalResponsible({
  responsibleName,
  responsibleEmail,
  responsiblePhone,
}: ClientLegalResponsibleProps) {
  const tForm = await getTranslations("clients.form");
  const t = await getTranslations("clients.legalResponsible");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          {tForm("responsibleSection")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {responsibleName && responsibleEmail ? (
          <>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                {tForm("responsibleName")}
              </label>
              <p className="font-medium">{responsibleName}</p>
            </div>
            <div className="flex items-start gap-3">
              <Mail size={16} className="mt-0.5 text-muted-foreground" />
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  {tForm("responsibleEmail")}
                </label>
                <p className="font-medium">{responsibleEmail}</p>
              </div>
            </div>
            {responsiblePhone && (
              <div className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 text-muted-foreground" />
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    {tForm("responsiblePhone")}
                  </label>
                  <p className="font-medium">{responsiblePhone}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}
      </CardContent>
    </Card>
  );
}
