export interface SecretOptions {
  workspaceId?: string;
  environment?: string; // ex: 'dev', 'staging', 'prod'
  path?: string; // caminhos dentro do Infisical (ex: '/integrations/stripe')
}

export interface ISecretManagementService {
  healthCheck(): Promise<{ status: "up" | "down"; latency: number }>;

  getSecret(key: string, options: SecretOptions): Promise<string>;

  getAllSecrets(options: SecretOptions): Promise<Record<string, string>>;

  createFolder(path: string, options?: SecretOptions): Promise<void>;

  upsertSecret(
    key: string,
    value: string,
    options?: SecretOptions
  ): Promise<void>;
}
