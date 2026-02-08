import { AppError } from "@/errors/AppError";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  ClientBlockerItem,
  IClientsRepository,
} from "@/repositories/IClientsRepository";

interface GetClientBlockersUseCaseRequest {
  slug: string;
  userId: string;
}

export class GetClientBlockersUseCase {
  constructor(private clientRepository: IClientsRepository) {}

  async execute({ slug, userId }: GetClientBlockersUseCaseRequest): Promise<{
    blockerItens: ClientBlockerItem[];
  }> {
    const [client, blockerItens] = await Promise.all([
      this.clientRepository.findBySlug(slug),
      this.clientRepository.getClientBlockers(slug),
    ]);

    if (!client) {
      throw new AppError("Cliente não localizado");
    }

    await checkUserPermissionForAsset("client", userId, client, "READ");

    return { blockerItens };
  }
}
