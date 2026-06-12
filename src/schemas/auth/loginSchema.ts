import { v, type ValidationKey } from "@/schemas/validationMessages";
import { z } from "zod";

export type ValidationTranslator = (key: ValidationKey) => string;

function m(t: ValidationTranslator | undefined, key: ValidationKey) {
  return t ? t(key) : key;
}

export function createLoginSchema(t?: ValidationTranslator) {
  return z.object({
    email: z.email(m(t, v.invalidEmail)),
    password: z.string().min(6, m(t, v.passwordMinLength)),
  });
}

export const loginSchema = createLoginSchema();

export type LoginSchema = z.infer<typeof loginSchema>;
