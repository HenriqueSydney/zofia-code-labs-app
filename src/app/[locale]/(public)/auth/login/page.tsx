import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { LoginForm } from "./components/LoginForm";
import { LoginWithProviders } from "./components/LoginWithProviders";
import { Separator } from "@/components/ui/separator";

export default async function Login() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Image with scrim */}
      <div className="relative lg:w-2/3 h-64 lg:h-auto overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')`,
          }}
        />

        {/* Dark translucent scrim */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-background/70 to-background/90" />

        {/* Inner shadow effect to make it look "sunken" */}
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />

        {/* Content on the image side */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 lg:p-16">
          <Image
            src="/zofia-logo.webp"
            alt="Zofia Code Labs"
            width={200}
            height={200}
          />
          <h1 className="text-2xl lg:text-4xl font-bold text-white text-center mb-4 drop-shadow-lg">
            Zofia Code Labs
          </h1>
          <p className="text-white/80 text-center max-w-md text-sm lg:text-base">
            Transformando ideias em soluções digitais inovadoras
          </p>
        </div>

        {/* Jagged/torn border effect - right side */}
        <div className="hidden lg:block absolute top-0 right-0 w-16 h-full">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full"
            style={{ filter: "drop-shadow(4px 0 8px rgba(0,0,0,0.3))" }}
          >
            <path
              d="M0,0 L100,0 L100,100 L0,100 
                 L15,95 L5,90 L20,85 L8,80 L18,75 L3,70 L15,65 L7,60 L20,55 L5,50 
                 L18,45 L8,40 L15,35 L3,30 L20,25 L7,20 L15,15 L5,10 L18,5 Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>

        {/* Jagged border for mobile - bottom */}
        <div className="lg:hidden absolute bottom-0 left-0 w-full h-8">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full"
            style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
          >
            <path
              d="M0,0 L0,100 L100,100 L100,0 
                 L95,15 L90,5 L85,20 L80,8 L75,18 L70,3 L65,15 L60,7 L55,20 L50,5 
                 L45,18 L40,8 L35,15 L30,3 L25,20 L20,7 L15,15 L10,5 L5,18 Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </div>

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
              <Separator />
              <LoginWithProviders />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
