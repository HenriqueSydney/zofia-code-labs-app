import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IClientsRepository } from "@/repositories/IClientsRepository";

export class DeleteClientUseCase {
  constructor(private clientsRepository: IClientsRepository) {}

  async execute(id: string, userId: string) {
    const client = await this.clientsRepository.findById(id);
    if (!client) {
      throw new Error("Cliente não encontrado.");
    }

    await checkUserPermissionForAsset("client", userId, client, "UPDATE");

    await this.clientsRepository.delete(id);
  }
}
