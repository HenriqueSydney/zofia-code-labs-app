import { IClientsRepository } from "@/repositories/IClientsRepository";

export class DeleteClientUseCase {
  constructor(private clientsRepository: IClientsRepository) {}

  async execute(id: string) {
    const client = await this.clientsRepository.findById(id);
    if (!client) {
      throw new Error("Cliente não encontrado.");
    }

    await this.clientsRepository.delete(id);
  }
}
