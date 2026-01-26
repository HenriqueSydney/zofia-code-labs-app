import { error } from "console";
import { z } from "zod";

// Schema de validação
export const projectFormSchema = z.object({
  name: z
    .string()
    .min(3, "O nome do projeto deve ter pelo menos 3 caracteres."),
  description: z.string().min(10, "A descrição deve ser mais detalhada."),
  clientId: z.string({ message: "Selecione um cliente." }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  estimatedStartDate: z.string().optional(), // Ou z.date() dependendo de como você trata datas
  endDate: z.string().optional(),
  totalBudget: z.number().min(0).optional(),
  tags: z
    .array(z.string(), { error: "O campo espera uma lista de Tags" })
    .optional(),
  documents: z
    .array(z.custom<File>((val) => val instanceof File, "Arquivo inválido"))
    .optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
