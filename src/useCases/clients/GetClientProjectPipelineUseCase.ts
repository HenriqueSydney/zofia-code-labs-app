import { AppError } from "@/errors/AppError";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import {
  IClientsRepository,
  ProjectPipelineMetric,
} from "@/repositories/IClientsRepository";

interface GetClientProjectPipelineUseCaseRequest {
  slug: string;
  userId: string;
}

export class GetClientProjectPipelineUseCase {
  constructor(private clientRepository: IClientsRepository) {}

  async execute({
    slug,
    userId,
  }: GetClientProjectPipelineUseCaseRequest): Promise<{
    projectPipelineMetric: ProjectPipelineMetric[];
  }> {
    const [client, projectPipelineMetric] = await Promise.all([
      this.clientRepository.findBySlug(slug),
      this.clientRepository.getProjectPipeline(slug),
    ]);

    if (!client) {
      throw new AppError("Cliente não localizado");
    }

    await checkUserPermissionForAsset("client", userId, client, "READ");

    return { projectPipelineMetric };
  }
}
