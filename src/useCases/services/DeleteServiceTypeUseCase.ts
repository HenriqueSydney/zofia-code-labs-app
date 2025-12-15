import { IServiceTypeRepository } from "@/repositories/IServiceTypeRepository";

interface DeleteServiceRequest {
  id: string;
  organizationId: string;
}

export class DeleteServiceTypeUseCase {
  constructor(private serviceTypeRepository: IServiceTypeRepository) {}

  async execute({ id, organizationId }: DeleteServiceRequest): Promise<void> {
    // 1. Verificar propriedade antes de deletar
    const existingService = await this.serviceTypeRepository.findById(
      id,
      organizationId
    );

    if (!existingService) {
      throw new Error(
        "Serviço não encontrado ou você não tem permissão para removê-lo."
      );
    }

    // 2. Deletar
    await this.serviceTypeRepository.delete(id);
  }
}
