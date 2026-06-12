import { v, type ValidationKey } from "@/schemas/validationMessages";
import z from "zod";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ValidationTranslator = (key: ValidationKey) => string;

function m(t: ValidationTranslator | undefined, key: ValidationKey) {
  return t ? t(key) : key;
}

export function createClientFormSchema(t?: ValidationTranslator) {
  return z.object({
    companyName: z.string().min(3, m(t, v.companyNameRequired)),
    tradeName: z.string(),
    cnpj: z.string(),
    email: z.email().or(z.literal("")),
    phone: z.string(),
    responsibleName: z.string().optional().nullable(),
    responsibleEmail: z.union([z.email(), z.literal("")]).optional().nullable(),
    responsiblePhone: z.string().optional().nullable(),
    logo: z
      .union([z.instanceof(File), z.string()])
      .nullable()
      .optional()
      .refine((file) => {
        if (!(file instanceof File)) return true;
        return file.size <= MAX_FILE_SIZE;
      }, m(t, v.fileMaxSize))
      .refine((file) => {
        if (!(file instanceof File)) return true;
        return ACCEPTED_IMAGE_TYPES.includes(file.type);
      }, m(t, v.invalidFileFormat)),
  });
}

export const clientFormSchema = createClientFormSchema();

export type ClientFormSchemaType = z.infer<typeof clientFormSchema>;
