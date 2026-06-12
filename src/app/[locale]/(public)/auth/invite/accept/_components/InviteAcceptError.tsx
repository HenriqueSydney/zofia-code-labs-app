import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

interface InviteAcceptErrorProps {
  message: string;
}

export async function InviteAcceptError({ message }: InviteAcceptErrorProps) {
  const t = await getTranslations("auth.inviteAccept");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-destructive">
            {t("errorTitle")}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link
            href="/auth/login"
            className="text-sm text-primary hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
