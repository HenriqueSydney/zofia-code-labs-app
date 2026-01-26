"use server";

import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { makeSyncServiceDefaultBacklogUseCase } from "@/useCases/backlog/factories/makeSyncServiceDefaultBacklogUseCase";

// Schema local para validação dos dados de entrada
const syncBacklogSchema = z.object({
  serviceTypeId: z.string().min(1, "O tipo de serviço é obrigatório."),
});

type SyncBacklogSchema = z.infer<typeof syncBacklogSchema>;

export async function syncServiceBacklogToProjectAction(
  data: SyncBacklogSchema,
  projectId: string,
  projectSlug: string,
  clientSlug: string,
) {
  // 1. Autenticação
  const session = await auth();
  if (!session?.user?.organizationId) {
    return {
      success: false,
      message: "Sessão expirada ou usuário sem organização vinculada.",
    };
  }

  // 2. Validação Zod
  const parsed = syncBacklogSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message || "Dados inválidos.",
    };
  }

  const { serviceTypeId } = parsed.data;

  try {
    // 3. Instanciação
    const syncUseCase = makeSyncServiceDefaultBacklogUseCase();

    // 4. Execução
    const count = await syncUseCase.execute({
      projectId,
      serviceTypeId,
      organizationId: session.user.organizationId,
      userId: session.user.id,
    });

    if (count === 0) {
      return {
        success: true, // Retorna true mas avisa que não houve mudanças
        message: "Nenhum item novo para importar deste serviço.",
      };
    }

    // 5. Revalidação
    // Ajuste a rota conforme sua estrutura (ex: se usar slug, precisará passar o slug)
    revalidatePath(`/clients/${clientSlug}/projects/${projectSlug}/backlog`);

    return {
      success: true,
      message: `${count} item(s) importado(s) com sucesso.`,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Erro interno ao sincronizar backlog.",
    };
  }
}
