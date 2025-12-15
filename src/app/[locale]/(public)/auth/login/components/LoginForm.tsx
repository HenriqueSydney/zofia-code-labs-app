"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginSchema } from "@/schemas/auth/loginSchema";
import { loginAction } from "@/actions/auth/loginAction";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const t = useTranslations();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginSchema) => {
    setServerError(null);

    startTransition(async () => {
      const result = await loginAction(data);

      // Se a função retornou algo, é porque deu erro ou não redirecionou.
      // Se tivesse redirecionado com sucesso, o fluxo teria sido interrompido pelo "throw error" no server
      if (result && !result.success) {
        setServerError(result.message || "Erro desconhecido");
      }

      // NÃO precisa de else { router.push }
      // O redirecionamento já aconteceu no servidor via 'throw error' -> HTTP 303
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* EMAIL */}
      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input
          type="email"
          placeholder="Email"
          {...register("email")}
          className="h-11 bg-background/50"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      {/* PASSWORD */}
      <div className="space-y-2">
        <Label htmlFor="password">{t("auth.password")}</Label>
        <Input
          type="password"
          placeholder="••••••••"
          {...register("password")}
          className="h-11 bg-background/50"
        />
      </div>

      {/* ERRO SERVIDOR */}
      {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

      <Button
        type="submit"
        className="w-full h-11 text-lg font-medium"
        disabled={loading}
      >
        {loading ? "Entrando..." : t("auth.loginButton")}
      </Button>
    </form>
  );
}
