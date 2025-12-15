"use server";

import { auth } from "@/auth"; // Seu setup de auth
import { createServiceCategorySchema } from "@/schemas/services/createServiceCategorySchema";
import { makeCreateServiceCategoryUseCase } from "@/useCases/services/factories/makeCreateServiceCategoryUseCase";
import { revalidatePath } from "next/cache";

export async function createServiceCategoryAction(data: unknown) {
  // 1. Autenticação
  const session = await auth();
  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Sessão expirada ou usuário sem organização vinculada.",
    };
  }

  // 2. Validação Zod (Input)
  const parsed = createServiceCategorySchema.safeParse(data);

  if (!parsed.success) {
    // Retorna o primeiro erro encontrado para simplificar
    return {
      success: false,
      message: parsed.error.issues[0].message || "Dados inválidos.",
    };
  }

  const { name, description, taxCode } = parsed.data;

  try {
    // 3. Instanciação das dependências (Factory manual)
    const createServiceCategoryUseCase = makeCreateServiceCategoryUseCase();

    // 4. Execução
    await createServiceCategoryUseCase.execute({
      organizationId: session.user.organizationId, // Pega da sessão, NUNCA do form
      name,
      description,
      taxCode,
    });

    // 5. Revalidação de cache (opcional, ajusta conforme sua rota)
    revalidatePath("/dashboard/services");

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Erro interno ao criar serviço.",
    };
  }
}
