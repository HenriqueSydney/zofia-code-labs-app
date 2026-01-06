export interface SetupProjectParams {
  projectName: string;
  projectSlug: string;
  organizationId: string;
  // Adicione outros metadados úteis
}

export interface SetupProjectResult {
  externalId: string; // ID gerado no serviço (ex: WebsiteID no Umami)
  metadata: Record<string, any>;
}

export interface IProjectLinkable {
  setupProject(params: SetupProjectParams): Promise<SetupProjectResult>;
}
