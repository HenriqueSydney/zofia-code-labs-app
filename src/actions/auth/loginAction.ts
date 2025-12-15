"use server";

import { signIn } from "@/auth";
import { loginSchema } from "@/schemas/auth/loginSchema";
import { AuthError } from "next-auth";

export async function loginAction(data: unknown) {
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: "Dados inválidos",
    };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard", 
    });

    return { success: true };
  } catch (error) {

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            message: "Email ou senha incorretos.",
          };
        default:
          return {
            success: false,
            message: "Erro na autenticação. Tente novamente.",
          };
      }
    }

    // Se não é erro do Auth.js, provavelmente é o REDIRECT de sucesso.
    // Lançamos ele novamente para o Next.js processar a navegação.
    throw error;
  }
}
