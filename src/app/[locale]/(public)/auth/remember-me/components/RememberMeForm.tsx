"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createForgotPasswordSchema,
  ForgotPasswordSchema,
} from "@/schemas/auth/forgotPasswordSchema";
import { requestPasswordResetAction } from "@/actions/auth/requestPasswordResetAction";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export function RememberMeForm() {
  const t = useTranslations();
  const router = useRouter();
  const tValidation = useTranslations("validation");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();

  const schema = useMemo(
    () => createForgotPasswordSchema((key) => tValidation(key)),
    [tValidation],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: ForgotPasswordSchema) => {
    setServerError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await requestPasswordResetAction(data);

      if (result.success) {
        setSuccessMessage(result.message ?? t("auth.rememberMe.success"));
        router.push("/auth/login");
        return;
      }

      setServerError(result.message || t("auth.errors.unknown"));
    });
  };

  if (successMessage) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-7 w-7" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {successMessage}
        </p>
        <Button asChild variant="outline" className="w-full h-11">
          <Link href="/auth/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("auth.rememberMe.backToLogin")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("auth.rememberMe.emailPlaceholder")}
          autoComplete="email"
          {...register("email")}
          className="h-11 bg-background/50"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

      <Button
        type="submit"
        className="w-full h-11 text-lg font-medium"
        disabled={loading}
      >
        {loading
          ? t("auth.rememberMe.submitting")
          : t("auth.rememberMe.submitButton")}
      </Button>

      <Button asChild variant="ghost" className="w-full h-11">
        <Link href="/auth/login">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("auth.rememberMe.backToLogin")}
        </Link>
      </Button>
    </form>
  );
}
