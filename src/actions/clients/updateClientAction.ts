"use server";

import { clientFormSchema } from "@/schemas/clients/clientFormSchema";
import { makeUpdateClientUseCase } from "@/useCases/clients/factories/makeUpdateClientUseCase";
import { revalidatePath } from "next/cache";

export async function updateClientAction(clientId: string, formData: FormData) {
  try {
    const rawData = {
      companyName: formData.get("companyName") as string,
      tradeName: formData.get("tradeName") as string,
      cnpj: formData.get("cnpj") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      // OrganizationId geralmente não muda na edição, então omitimos
    };

    // Cria um schema parcial para update (organizationId não é necessário aqui)
    const validatedData = clientFormSchema.parse(rawData);

    const logoFile = formData.get("logo") as File | null;

    const file =
      logoFile instanceof File && logoFile.size > 0 ? logoFile : undefined;

    const useCase = makeUpdateClientUseCase();

    await useCase.execute({
      id: clientId,
      ...validatedData,
      file,
    });

    revalidatePath("/clients");
    return { success: true, message: "Cliente atualizado com sucesso!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Erro ao atualizar cliente." };
  }
}
