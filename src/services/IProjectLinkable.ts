export interface SetupProjectParams<T> {
  projectName: string;
  projectSlug: string;
  organizationId: string;
  data?: T;
}

export interface SetupProjectResult {
  externalId: string; 
  metadata: Record<string, any>;
}

export interface IProjectLinkable {
  setupProject<T>(params: SetupProjectParams<T>): Promise<SetupProjectResult>;
}
