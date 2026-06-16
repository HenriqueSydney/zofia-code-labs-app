import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "./components/LoginForm";
import { LoginWithProviders } from "./components/LoginWithProviders";
import { Separator } from "@/components/ui/separator";
import { AuthHeroPanel } from "../_components/AuthHeroPanel";

export default async function Login() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AuthHeroPanel tagline="Transformando ideias em soluções digitais inovadoras" />

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t("auth.login")}
              </CardTitle>
              <CardDescription className="text-center">
                {t("auth.loginDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <LoginForm />
              <p className="text-center text-sm">
                <Link
                  href="/auth/remember-me"
                  className="text-muted-foreground hover:underline"
                >
                  {t("auth.forgotPassword")}
                </Link>
              </p>
              <Separator />
              {/* <LoginWithProviders /> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
