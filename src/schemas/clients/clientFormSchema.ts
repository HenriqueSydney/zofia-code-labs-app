import z from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const clientFormSchema = z.object({
  companyName: z.string().min(3, "Razão Social é obrigatória"),
  tradeName: z.string(),
  cnpj: z.string(), // Adicione validação de regex se quiser
  email: z.email().or(z.literal("")),
  phone: z.string(),
  logo: z
    .union([
      z.instanceof(File), // Caso 1: Novo Upload (Objeto File)
      z.string(), // Caso 2: Edição (URL vinda do banco)
    ])
    .nullable() // Caso 3: Removeu a imagem
    .optional() // Caso 4: Não mexeu
    .refine((file) => {
      // Regra 1: Tamanho
      // Se NÃO for um arquivo (é string ou null), ignoramos a validação de tamanho
      if (!(file instanceof File)) return true;

      return file.size <= MAX_FILE_SIZE;
    }, "O arquivo deve ter no máximo 2MB")
    .refine((file) => {
      // Regra 2: Tipo
      if (!(file instanceof File)) return true;

      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, "Formato inválido. Use JPG, PNG ou WebP"),
});

export type ClientFormSchemaType = z.infer<typeof clientFormSchema>;
