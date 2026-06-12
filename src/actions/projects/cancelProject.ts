"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { cancelProjectSchema } from "@/schemas/projects/cancelProjectSchema";
import { makeCancelProjectUseCase } from "@/useCases/projects/factories/makeCancelProjectUseCase";
import { revalidatePath } from "next/cache";

export async function cancelProjectAction(projectId: string) {
  try {
    const session = await auth();
    if (!session?.user) return { error: await serverErrorMessage("unauthorized") };

    const validation = cancelProjectSchema.safeParse({ id: projectId });
    if (!validation.success)
      return { error: await serverErrorMessage("invalidProjectId") };

    const useCase = makeCancelProjectUseCase();

    const { slug, clientSlug } = await useCase.execute({ projectId, userId: session.user.id });
    revalidatePath(`/clients/${clientSlug}/projects/${slug}`);
    revalidatePath("/projects");
    return { success: true, message: await resolveSuccessMessage("projectCancelled") };
  } catch (error) {
    return { error: await resolveActionErrorMessage(error) };
  }
}
