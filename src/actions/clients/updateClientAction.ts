"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { clientFormSchema } from "@/schemas/clients/clientFormSchema";
import { makeUpdateClientUseCase } from "@/useCases/clients/factories/makeUpdateClientUseCase";
import { revalidatePath } from "next/cache";

export async function updateClientAction(clientId: string, formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user) return { success: false, message: await serverErrorMessage("unauthorized") };
    const rawData = {
      companyName: formData.get("companyName") as string,
      tradeName: formData.get("tradeName") as string,
      cnpj: formData.get("cnpj") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      responsibleName: (formData.get("responsibleName") as string) || null,
      responsibleEmail: (formData.get("responsibleEmail") as string) || null,
      responsiblePhone: (formData.get("responsiblePhone") as string) || null,
    };

    // Cria um schema parcial para update (organizationId não é necessário aqui)
    const validatedData = clientFormSchema.parse(rawData);

    const logoFile = formData.get("logo") as File | null;

    const file =
      logoFile instanceof File && logoFile.size > 0 ? logoFile : undefined;

    const useCase = makeUpdateClientUseCase();

    await useCase.execute({
      data: {
        id: clientId,
        ...validatedData,
        file,
      },
      userId: session.user.id,
      memberRole: session.user.memberRole,
    });

    revalidatePath("/clients");
    return { success: true, message: await resolveSuccessMessage("clientUpdated") };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, message };
  }
}
