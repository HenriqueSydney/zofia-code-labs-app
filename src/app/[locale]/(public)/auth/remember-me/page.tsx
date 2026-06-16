import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { RememberMeForm } from "./components/RememberMeForm";
import { AuthHeroPanel } from "../_components/AuthHeroPanel";

export default async function RememberMePage() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AuthHeroPanel tagline={t("auth.rememberMe.hero")} />

      <div className="flex-1 flex items-center justify-center bg-background p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t("auth.rememberMe.title")}
              </CardTitle>
              <CardDescription className="text-center">
                {t("auth.rememberMe.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RememberMeForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
