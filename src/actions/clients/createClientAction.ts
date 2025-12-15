"use server";

import { clientFormSchema } from "@/schemas/clients/clientFormSchema";
import { makeCreateClientUseCase } from "@/useCases/clients/factories/makeCreateClientUseCase";
import { revalidatePath } from "next/cache";

export async function createClientAction(formData: FormData) {
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

    const useCase = makeCreateClientUseCase();

    await useCase.execute({
      organizationId: "cmizei37c00008del0bo3sbsq",
      ...validatedData,
    });

    revalidatePath("/clients");
    return { success: true, message: "Cliente cadastrado com sucesso!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao cadastrar cliente." };
  }
}
