"use server";

import { auth } from "@/auth"; // Seu setup de auth
import { createServiceTypeSchema } from "@/schemas/services/createServiceTypeSchema";
import { makeCreateServiceTypeUseCase } from "@/useCases/services/factories/makeCreateServiceUseCase";
import { revalidatePath } from "next/cache";

export async function createServiceTypeAction(data: unknown) {
  // 1. Autenticação
  const session = await auth();
  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Sessão expirada ou usuário sem organização vinculada.",
    };
  }

  // 2. Validação Zod (Input)
  const parsed = createServiceTypeSchema.safeParse(data);

  if (!parsed.success) {
 
    // Retorna o primeiro erro encontrado para simplificar
    return {
      success: false,
      message: parsed.error.issues[0].message || "Dados inválidos.",
    };
  }

  const { name, description, basePrice, categoryId } = parsed.data;

  const finalPrice =
    basePrice === 0 || basePrice === undefined ? null : basePrice;

  try {
    // 3. Instanciação das dependências (Factory manual)
    const createServiceTypeUseCase = makeCreateServiceTypeUseCase();

    // 4. Execução
    await createServiceTypeUseCase.execute({
      organizationId: session.user.organizationId, // Pega da sessão, NUNCA do form
      name,
      description,
      basePrice: finalPrice,
      categoryId,
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
