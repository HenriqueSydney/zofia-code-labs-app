import { sendContractReadyEmail } from "@/email/send/sendContractReadyEmail";
import { resolveClientContactEmail } from "@/lib/clients/resolveClientContactEmail";
import { date } from "@/lib/dayjs";
import { apiLogger } from "@/lib/logger";
import { buildContractSignatureUrl } from "@/lib/project/projectStatusEmailContext";

type ContractReadyEmailContract = {
  id: string;
  project: {
    name: string;
    client: {
      slug: string;
      tradeName: string;
      companyName: string;
      email: string;
      responsibleEmail?: string | null;
    };
  };
};

export async function sendContractReadyEmailForContract(
  contract: ContractReadyEmailContract,
): Promise<void> {
  const contactEmail = resolveClientContactEmail(contract.project.client);

  if (!contactEmail) {
    return;
  }

  try {
    await sendContractReadyEmail({
      to: contactEmail,
      clientName:
        contract.project.client.tradeName || contract.project.client.companyName,
      projectName: contract.project.name,
      contractUrl: buildContractSignatureUrl(
        contract.project.client.slug,
        contract.id,
      ),
      expirationDate: date().add(30, "day").format("DD [de] MMMM [de] YYYY"),
    });

    apiLogger.info(
      { contractId: contract.id, to: contactEmail },
      "ContractReadyEmail enviado",
    );
  } catch (error) {
    apiLogger.error(
      { err: error, contractId: contract.id },
      "Falha ao enviar ContractReadyEmail",
    );
    throw error;
  }
}
