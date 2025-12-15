import { z } from "zod";

// Schema de validação
export const projectFormSchema = z.object({
  name: z
    .string()
    .min(3, "O nome do projeto deve ter pelo menos 3 caracteres."),
  description: z.string().min(10, "A descrição deve ser mais detalhada."),
  clientId: z.string({ message: "Selecione um cliente." }),
  documents: z.array(
    z.custom<File>((val) => val instanceof File, "Arquivo inválido")
  ),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
