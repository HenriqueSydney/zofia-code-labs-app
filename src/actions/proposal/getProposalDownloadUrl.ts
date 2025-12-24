// app/actions/proposals.ts
"use server";

import { makeProposalRepository } from "@/repositories/factories/makeProposalRepository";
import { makeS3StorageService } from "@/services/s3Client/makeS3StorageService";

export async function getProposalDownloadUrl(proposalId: string) {
 
  try {
    const proposalRepository = makeProposalRepository();
    const proposal = await proposalRepository.findById(proposalId);

    if (!proposal) throw new Error("Proposta não localizada");
    if (!proposal.fileKey) {
      throw new Error("Proposta não possui arquivo a ser baixado");
    }

    // 2. Gerar URL temporária
    const storageService = makeS3StorageService(); // ou via injeção
    const url = await storageService.getSignedUrl(proposal.fileKey);

    return { success: true, url };
  } catch (error) {
    console.log(error);
    let message = "Erro ao localizar o arquivo para download";
    if (error instanceof Error) {
      message = error.message;
    }

    return { error: message };
  }
}
