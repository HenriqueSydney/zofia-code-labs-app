"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth"; // Seu helper de auth
import { makeCreateDocumentTemplateUseCase } from "@/useCases/documentTemplates/factories/makeCreateDocumentTemplateUseCase";
import {
  createTemplateSchema,
  CreateTemplateSchemaType,
} from "@/schemas/documentTemplates/createDocumentTemplateSchema";

export async function createDocumentTemplateAction(
  formData: CreateTemplateSchemaType
) {
  try {
    const session = await auth();
    // Assumindo que o organizationId vem da sessão ou contexto atual do usuário
    const organizationId = session?.user?.organizationId;

    if (!organizationId) {
      return { error: "Organization context not found or unauthorized." };
    }

    // Validação Zod no Server
    const validation = createTemplateSchema.safeParse(formData);
    if (!validation.success) {
      return { error: "Dados inválidos.", details: validation.error.format() };
    }

    const useCase = makeCreateDocumentTemplateUseCase();

    const { data } = validation;

    await useCase.execute({
      content: data.content,
      templateType: data.type,
      title: data.title,
      userId: session.user.id,
      organizationId: session.user.organizationId,
    });

    revalidatePath("/settings/templates"); // Atualize conforme sua rota
    return { success: true, message: "Modelo criado com sucesso!" };
  } catch (err: any) {
    console.error(err);
    return { error: "Erro ao criar modelo. Tente novamente." };
  }
}
