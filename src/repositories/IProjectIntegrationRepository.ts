import { Prisma, ProjectIntegration } from "@/generated/prisma/client";

// Tipo estendido para facilitar o uso no Frontend com logos e nomes
export type ProjectIntegrationWithDetails = ProjectIntegration & {
  integrationType: {
    name: string;
    slug: string;
    logo: string | null;
  };
  organizationIntegration: {
    organizationId: string;
  };
};

export interface IProjectIntegrationRepository {
  create(
    data: Prisma.ProjectIntegrationUncheckedCreateInput
  ): Promise<ProjectIntegration>;
  findById(id: string): Promise<ProjectIntegrationWithDetails | null>;
  findByProjectAndType(
    projectId: string,
    typeId: string
  ): Promise<ProjectIntegrationWithDetails | null>;
  findByProjectAndSlug(
    projectSlug: string,
    typeSlug: string
  ): Promise<ProjectIntegrationWithDetails | null>;
  listByProject(projectId: string): Promise<ProjectIntegrationWithDetails[]>;
  update(
    id: string,
    data: Prisma.ProjectIntegrationUpdateInput
  ): Promise<ProjectIntegration>;
  delete(id: string): Promise<void>;
}
