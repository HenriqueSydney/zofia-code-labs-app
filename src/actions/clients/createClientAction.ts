"use server";

import { auth } from "@/auth";
import { handleErrors } from "@/errors/handleErrors";
import { clientFormSchema } from "@/schemas/clients/clientFormSchema";
import { makeCreateClientUseCase } from "@/useCases/clients/factories/makeCreateClientUseCase";
import { revalidatePath } from "next/cache";

export async function createClientAction(formData: FormData) {
  const session = await auth();

  if (!session?.user) return { success: false, message: "Não autorizado" };

  try {
    const rawData = {
      companyName: formData.get("companyName") as string,
      tradeName: formData.get("tradeName") as string,
      cnpj: formData.get("cnpj") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
    };

    // Validação
    const validatedData = clientFormSchema.parse(rawData);

    const logoFile = formData.get("logo") as File | null;

    const file =
      logoFile instanceof File && logoFile.size > 0 ? logoFile : undefined;

    const useCase = makeCreateClientUseCase();

    await useCase.execute(
      {
        organizationId: "cmizei37c00008del0bo3sbsq",
        ...validatedData,
        file,
      },
      session.user.id,
    );

    revalidatePath("/clients");
    return { success: true, message: "Cliente cadastrado com sucesso!" };
  } catch (error) {
    const message = handleErrors(error);
    return { success: false, message: message };
  }
}
