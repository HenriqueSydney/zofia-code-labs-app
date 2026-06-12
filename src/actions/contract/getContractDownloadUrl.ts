// app/actions/contracts.ts
"use server";

import { ResourceNotFoundError, ValidationError } from "@/errors";
import { makeContractRepository } from "@/repositories/factories/makeContractRepository";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";

export async function getContractDownloadUrl(contractId: string) {
  try {
    const contractRepository = makeContractRepository();
    const contract = await contractRepository.findById(contractId);

    if (!contract) throw new ResourceNotFoundError("contractNotFound");
    if (!contract.fileKey) {
      throw new ValidationError("contractNoFile");
    }

    // 2. Gerar URL temporária
    const storageService = makeS3StorageService(); // ou via injeção
    const url = await storageService.getSignedUrl(contract.fileKey);

    return { success: true, url };
  } catch (error) {
    let message = "Erro ao localizar o arquivo para download";
    if (error instanceof Error) {
      message = error.message;
    }

    return { error: message };
  }
}
