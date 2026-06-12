"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { v } from "@/schemas/validationMessages";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { makeSyncServiceDefaultBacklogUseCase } from "@/useCases/backlog/factories/makeSyncServiceDefaultBacklogUseCase";

// Schema local para validação dos dados de entrada
const syncBacklogSchema = z.object({
  serviceTypeId: z.string().min(1, v.serviceIdInvalid),
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
      message: await serverErrorMessage("sessionExpiredNoOrg"),
    };
  }

  // 2. Validação Zod
  const parsed = syncBacklogSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0].message || await serverErrorMessage("invalidData"),
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
        message: await serverErrorMessage("noBacklogItemsToImport"),
      };
    }

    // 5. Revalidação
    // Ajuste a rota conforme sua estrutura (ex: se usar slug, precisará passar o slug)
    revalidatePath(`/clients/${clientSlug}/projects/${projectSlug}/backlog`);

    return {
      success: true,
      message: await resolveSuccessMessage("backlogImported", { count }),
    };
  } catch (error) {
    return {
      success: false,
      message: await resolveActionErrorMessage(error),
    };
  }
}
