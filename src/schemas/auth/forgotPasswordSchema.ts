import { v, type ValidationKey } from "@/schemas/validationMessages";
import { z } from "zod";

export type ValidationTranslator = (key: ValidationKey) => string;

function m(t: ValidationTranslator | undefined, key: ValidationKey) {
  return t ? t(key) : key;
}

export function createForgotPasswordSchema(t?: ValidationTranslator) {
  return z.object({
    email: z.email(m(t, v.invalidEmail)),
  });
}

export const forgotPasswordSchema = createForgotPasswordSchema();

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
