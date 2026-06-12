import { ResourceNotFoundError } from "@/errors";
import { assertClientAccessForUser } from "@/lib/auth/resolveClientAccess";
import { MemberRole } from "@/generated/prisma/enums";
import {
  DeliveryEvolutionMetric,
  IClientsRepository,
} from "@/repositories/IClientsRepository";

interface GetClientDeliveryEvolutionUseCaseRequest {
  slug: string;
  userId: string;
  memberRole?: MemberRole | null;
}

export class GetClientDeliveryEvolutionUseCase {
  constructor(private clientRepository: IClientsRepository) {}

  async execute({
    slug,
    userId,
    memberRole,
  }: GetClientDeliveryEvolutionUseCaseRequest): Promise<{
    deliveryEvolution: DeliveryEvolutionMetric[];
  }> {
    const [client, deliveryEvolution] = await Promise.all([
      this.clientRepository.findBySlug(slug),
      this.clientRepository.getDeliveryEvolution(slug),
    ]);

    if (!client) {
      throw new ResourceNotFoundError("Cliente não localizado");
    }

    await assertClientAccessForUser({
      userId,
      memberRole,
      clientSlug: slug,
      client,
      operation: "READ",
    });

    return { deliveryEvolution };
  }
}
