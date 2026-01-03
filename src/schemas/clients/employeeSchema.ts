import { z } from "zod";

export const employeeSchema = z.object({
  email: z.email("E-mail inválido"),
  name: z.string().min(3, "Nome muito curto"),
  jobTitle: z.string().min(2, "Cargo é obrigatório"),
  permissionRole: z.enum(["ADMIN", "USER", "VIEWER"]),
});

export type EmployeeSchemaType = z.infer<typeof employeeSchema>;
