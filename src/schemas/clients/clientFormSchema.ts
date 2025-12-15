import z from "zod";

export const clientFormSchema = z.object({
  companyName: z.string().min(3, "Razão Social é obrigatória"),
  tradeName: z.string(),
  cnpj: z.string(), // Adicione validação de regex se quiser
  email: z.email().or(z.literal("")),
  phone: z.string(),
});

export type ClientFormSchemaType = z.infer<typeof clientFormSchema>;
