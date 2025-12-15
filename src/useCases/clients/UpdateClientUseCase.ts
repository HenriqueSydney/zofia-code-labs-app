import {
  IClientsRepository,
  IUpdateClientDTO,
} from "@/repositories/IClientsRepository";

export class UpdateClientUseCase {
  constructor(private clientsRepository: IClientsRepository) {}

  async execute(data: IUpdateClientDTO) {
    const client = await this.clientsRepository.findById(data.id);

    if (!client) {
      throw new Error("Cliente não encontrado.");
    }

    return await this.clientsRepository.update(data);
  }
}
