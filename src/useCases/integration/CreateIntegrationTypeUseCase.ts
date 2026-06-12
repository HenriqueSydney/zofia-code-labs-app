import { ConflictError } from "@/errors";
import { IntegrationType } from "@/generated/prisma/client";
import { checkUserPermissionForAsset } from "@/lib/auth/checkUserPermissionForAsset";
import { IIntegrationTypeRepository } from "@/repositories/IIntegrationTypeRepository";
import { generateSlug } from "@/utils/generateSlug";

interface CreateRequest {
  name: string;
  logo?: string | null;
  description: string;
  userId: string;
  organizationId: string;
}

export class CreateIntegrationTypeUseCase {
  constructor(private repository: IIntegrationTypeRepository) {}

  async execute({ userId, organizationId, ...data }: CreateRequest): Promise<IntegrationType> {
    await checkUserPermissionForAsset(
      "integrationType",
      userId,
      { organizationId },
      "CREATE"
    );
    const slug = generateSlug({ title: data.name });
    const alreadyExists = await this.repository.findBySlug(slug);

    if (alreadyExists) {
      throw new ConflictError("Essa integração já existe no catálogo global.");
    }

    return await this.repository.create({ ...data, slug });
  }
}
