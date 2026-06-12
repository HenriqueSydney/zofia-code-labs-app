import { v, type ValidationKey } from "@/schemas/validationMessages";
import { z } from "zod";

export type ValidationTranslator = (key: ValidationKey) => string;

function m(t: ValidationTranslator | undefined, key: ValidationKey) {
  return t ? t(key) : key;
}

export function createEmployeeSchema(t?: ValidationTranslator) {
  return z.object({
    email: z.email(m(t, v.invalidEmail)),
    name: z.string().min(3, m(t, v.nameMinLength)),
    jobTitle: z.string().min(2, m(t, v.jobTitleRequired)),
    permissionRole: z.enum(["ADMIN", "USER", "VIEWER"]),
  });
}

export const employeeSchema = createEmployeeSchema();

export type EmployeeSchemaType = z.infer<typeof employeeSchema>;
