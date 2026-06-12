import { ResourceNotFoundError } from "@/errors";
import { assertClientAccessForUser } from "@/lib/auth/resolveClientAccess";
import { MemberRole } from "@/generated/prisma/enums";
import {
  IClientsRepository,
  ProjectPipelineMetric,
} from "@/repositories/IClientsRepository";

interface GetClientProjectPipelineUseCaseRequest {
  slug: string;
  userId: string;
  memberRole?: MemberRole | null;
}

export class GetClientProjectPipelineUseCase {
  constructor(private clientRepository: IClientsRepository) {}

  async execute({
    slug,
    userId,
    memberRole,
  }: GetClientProjectPipelineUseCaseRequest): Promise<{
    projectPipelineMetric: ProjectPipelineMetric[];
  }> {
    const [client, projectPipelineMetric] = await Promise.all([
      this.clientRepository.findBySlug(slug),
      this.clientRepository.getProjectPipeline(slug),
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

    return { projectPipelineMetric };
  }
}
