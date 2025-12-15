import { AppError } from "@/errors/AppError";
import {
  IClientsRepository,
  ICreateClientDTO,
} from "@/repositories/IClientsRepository";

export class CreateClientUseCase {
  constructor(private clientsRepository: IClientsRepository) {}

  async execute(data: ICreateClientDTO) {
    const existingClient = await this.clientsRepository.findByCnpj(data.cnpj)

    if(existingClient) throw new AppError("Empresa com mesmo CNPJ já cadastrada")

    return await this.clientsRepository.create(data);
  }
}
