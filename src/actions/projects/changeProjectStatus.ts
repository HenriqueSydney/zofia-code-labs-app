"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth"; // Seu helper de auth (NextAuth/Auth.js)
import { PROJECT_STATUS_FLOW } from "@/domain/project/ProjectWorkflow";
import { makeChangeProjectStatusUseCase } from "@/useCases/projects/factories/makeChangeProjectStatusUseCase";

const changeStatusSchema = z.object({
  projectId: z.cuid(),
  newStatus: z.enum(PROJECT_STATUS_FLOW),
});

export async function changeProjectStatusAction(formData: {
  projectId: string;
  newStatus: string;
  data?: any; // Payload flexível
}) {
  try {
    // 1. Autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return { error: await serverErrorMessage("unauthorized") };
    }

    // 2. Validação de Input (Zod)
    const result = changeStatusSchema.safeParse(formData);

    if (!result.success) {
      return { error: await serverErrorMessage("invalidStatus") };
    }

    const { projectId, newStatus } = result.data;

    const changeStatusUseCase = makeChangeProjectStatusUseCase();

    // 4. Executar Use Case
    const updatedProject = await changeStatusUseCase.execute({
      projectId,
      newStatus,
      userId: session.user.id,
      data: formData.data,
    });

    // 5. Revalidar cache do Next.js (atualiza a UI)
    revalidatePath(
      `/clients/${updatedProject.clientId.slug}/projects/${updatedProject.slug}`
    );
    revalidatePath("/projects");

    return { success: true, message: await resolveSuccessMessage("statusUpdatedSuccess") };
  } catch (error) {
    return {
      error: await resolveActionErrorMessage(error),
    };
  }
}
