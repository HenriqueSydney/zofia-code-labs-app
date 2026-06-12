"use server";

import { resolveActionErrorMessage, resolveSuccessMessage, serverErrorMessage } from "@/errors/resolveActionErrorMessage";
import { auth } from "@/auth";
import { clientFormSchema } from "@/schemas/clients/clientFormSchema";
import { makeCreateClientUseCase } from "@/useCases/clients/factories/makeCreateClientUseCase";
import { revalidatePath } from "next/cache";

export async function createClientAction(formData: FormData) {
  const session = await auth();

  if (!session?.user) return { success: false, message: await serverErrorMessage("unauthorized") };

  try {
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

    // Validação
    const validatedData = clientFormSchema.parse(rawData);

    const logoFile = formData.get("logo") as File | null;

    const file =
      logoFile instanceof File && logoFile.size > 0 ? logoFile : undefined;

    const useCase = makeCreateClientUseCase();

    await useCase.execute(
      {
        organizationId: session.user.organizationId,
        ...validatedData,
        file,
      },
      session.user.id,
    );

    revalidatePath("/clients");
    return { success: true, message: await resolveSuccessMessage("clientCreated") };
  } catch (error) {
    const message = await resolveActionErrorMessage(error);
    return { success: false, message: message };
  }
}
