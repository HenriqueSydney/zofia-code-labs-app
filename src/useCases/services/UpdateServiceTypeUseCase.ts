import { IServiceTypeRepository } from "@/repositories/IServiceTypeRepository";

interface UpdateServiceRequest {
  id: string;
  organizationId: string;
  data: {
    name: string;
    categoryId?: string;
    description?: string | null;
    basePrice?: number | null;
    active?: boolean;
  };
}

export class UpdateServiceTypeUseCase {
  constructor(private serviceTypeRepository: IServiceTypeRepository) {}

  async execute({
    id,
    organizationId,
    data,
  }: UpdateServiceRequest): Promise<void> {
    // 1. Verificar se o serviço existe E pertence à organização
    const existingService = await this.serviceTypeRepository.findById(
      id,
      organizationId
    );

    if (!existingService) {
      throw new Error(
        "Serviço não encontrado ou você não tem permissão para editá-lo."
      );
    }

    // 2. Atualizar
    await this.serviceTypeRepository.update(id, {
      organizationId,
      ...data,
    });
  }
}
