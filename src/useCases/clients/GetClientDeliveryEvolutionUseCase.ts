import { AppError } from "@/errors/AppError";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  DeliveryEvolutionMetric,
  IClientsRepository,
} from "@/repositories/IClientsRepository";

interface GetClientDeliveryEvolutionUseCaseRequest {
  slug: string;
  userId: string;
}

export class GetClientDeliveryEvolutionUseCase {
  constructor(private clientRepository: IClientsRepository) {}

  async execute({
    slug,
    userId,
  }: GetClientDeliveryEvolutionUseCaseRequest): Promise<{
    deliveryEvolution: DeliveryEvolutionMetric[];
  }> {
    const [client, deliveryEvolution] = await Promise.all([
      this.clientRepository.findBySlug(slug),
      this.clientRepository.getDeliveryEvolution(slug),
    ]);

    if (!client) {
      throw new AppError("Cliente não localizado");
    }

    await checkUserPermissionForAsset("client", userId, client, "READ");

    return { deliveryEvolution };
  }
}
